/**
 * Copyright 2020 Bart Butenaers
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
 module.exports = function(RED) {
    var settings = RED.settings;
    const fetch = require('node-fetch');
    const FormData = require('form-data');

    function PlateRecognizerNode(config) {
        RED.nodes.createNode(this, config);
        this.url             = config.url;
        this.inputField      = config.inputField;
        this.outputField     = config.outputField;
        this.ignoreDuring    = config.ignoreDuring;
        this.makeAndModel    = config.makeAndModel;
        this.separateMsg     = config.separateMsg;
        this.regionFilter    = config.regionFilter;
        this.statusText      = config.statusText;
        this.cameraId        = config.cameraId;
        this.regionListValue = null;
        this.isRecognizing   = false;
                
        var node = this;
        
        if (node.regionFilter) {
            try {
                // Convert the value list to the correct value, i.e. an array that we start reading from index 0
                node.regionListValue = RED.util.evaluateNodeProperty(config.regionList, config.regionListType, node);
            }
            catch(exc) {
                node.error("Region independent recognition will be executed, due to invalid region list json array format");
            }
        }
        
        node.on("input", function(msg) {
            if (node.ignoreDuring && node.isRecognizing) {
                node.status({fill:"yellow",shape:"ring",text:"recognizing"});
                return;
            }
            
            node.status({fill:"blue",shape:"dot",text:"recognizing"});
            node.isRecognizing = true;
            
            // Get the image specified in the input message
            var image = RED.util.getMessageProperty(msg, node.inputField);

            // Make sure all images are base64 encoded
            if (Buffer.isBuffer(image)) {
                image = image.toString("base64");
            }
            
            var body = new FormData();
           
            body.append('upload', image);
            body.append('mmc', node.makeAndModel.toString());

            if (node.cameraId != null){
            body.append('camera_id', node.cameraId.toString());
            }

            // Always send the current timestamp to the service
            var d = new Date();
            var s = d.toISOString();
            body.append('timestamp', s);

            if (node.regionFilter && node.regionListValue) {
                for (var i = 0; i < node.regionListValue.length; i++) {
                    body.append('regions', node.regionListValue[i]);
                }
            }

            // Pass the base64 encoded image to the cloud (or docker) service 
            fetch(node.url, {
                method: 'POST',
                headers: {
                    "Authorization": "Token " + node.credentials.apiToken
                },
                body: body
            }).then( function(res) {
                if (res.ok) { // res.status >= 200 && res.status < 300
                    // Convert the response to a JSON object
                    res.json().then( function(resultAsJson) {
                        // Make sure the status of the response is available in the output message, for error handling
                        resultAsJson.status = res.status;
                        resultAsJson.statusText = res.statusText
                        
                        // Store the recognition result (in json format) in the specified output message field
                        RED.util.setMessageProperty(msg, node.outputField, resultAsJson, true);
                        
                        // Show the required node status
                        switch (node.statusText) {
                            case "none":
                                node.status({ });
                                break;
                            case "count":
                                var plateCount = resultAsJson.results.length + " plates";
                                node.status({ fill: "blue",shape: "dot",text: plateCount });
                                break;
                            case "plates":
                                var plates = "";
                                
                                for (var i = 0; i < resultAsJson.results.length; i++) {
                                    if (i > 0) plates = plates + ",";
                                    plates = plates + resultAsJson.results[i].plate.toUpperCase();
                                }
                                
                                node.status({ fill: "blue",shape: "dot",text: plates });
                                break;
                            case "scores":
                                var platesAndScores = "";
                                
                                for (var i = 0; i < resultAsJson.results.length; i++) {
                                    var result = resultAsJson.results[i];
                                    var score = Math.round(result.score * 10) / 10;
                                    if (i > 0) platesAndScores = platesAndScores + ",";
                                    platesAndScores = platesAndScores + result.plate.toUpperCase() + "(" + score * 100 + "%)";
                                }
                                
                                node.status({ fill: "blue",shape: "dot",text: platesAndScores });
                                break;
                        }
                        
                        // Check whether the plates need to be send as separate output messages
                        if (node.separateMsg) {
                            var plateCount = resultAsJson.results.length;
                            
                            if (plateCount === 0) {
                                // When no plate found, replace the empty array by an empty element
                                resultAsJson.results = {};
                                
                                // A single output message containing NO plate
                                node.send([msg, null]);
                            }
                            else {
                                // All plates (except the first one) will be send as clones
                                for (var i = 1; i < plateCount; i++) {
                                    var clonedMsg = RED.util.cloneMessage(msg);
                                    
                                    var clonedResultAsJson = RED.util.getMessageProperty(clonedMsg, node.outputField);
                                    clonedResultAsJson.results = clonedResultAsJson.results[i];

                                    // A single output message containing the n-th plate
                                    node.send([clonedMsg, null]);
                                }
                                
                                // For performance the first plate will be send uncloned (i.e. the original msg)
                                resultAsJson.results = resultAsJson.results[0];
                                node.send([msg, null]);
                            }
                        }
                        else {
                            // A single output message containing an array with ALL recognized plates
                            node.send([msg, null]);
                        }
                    }).catch( function(error) {
                        // Failed to parse the json
                        node.send([null, msg]);
                        node.status({ fill: "red",shape: "dot",text: "JSON parse failed" });
                    })
                }
                else {
                    // An application error happened, i.e. we got result from the service but not an optimistic one...
                    // For example we have hit our monthly maximum number of allowed recognitions.
                    // Or when the number of license plates is too high, we get an internal server error (so we even cannot parse the json)
                    node.send([null, msg]);
                    node.status({ fill: "red",shape: "dot",text: res.statusText });
                }
            
                node.isRecognizing = false;
            })
            .catch( function(err) {
                // A real failure happened, i.e. we even weren't able to get a result from the service...
                node.isRecognizing = false;
                node.error("License plate recognition failed: " + err);
                node.status({fill:"red",shape:"dot",text:"failed"});
                
                node.isRecognizing = false;
            });
        });

        node.on("close", function() {
            node.status({ });
            node.isRecognizing = false;
        });
    }

    RED.nodes.registerType("plate-recognizer", PlateRecognizerNode, {
        credentials: {
            apiToken: {type: "password"}
        }
    });
}
