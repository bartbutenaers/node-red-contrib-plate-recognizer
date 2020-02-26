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
        this.regionFilter    = config.regionFilter;
        this.statusText      = config.statusText;
        this.regionListValue = null;
        this.isRecognizing   = false;
        this.cameraid        = config.cameraid
        this.timestamp       = config.timestamp
                
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


            if (node.cameraid != null){
            body.append('camera_id', node.cameraid.toString());
            }
            if (node.timestamp) {
                var d = new Date();
                var s = d.toISOString();
                body.append('timestamp', s);
            }

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
                res.json().then( function(resultAsJson) {
                    // Store the recognition result (in json format) in the specified output message field
                    RED.util.setMessageProperty(msg, node.outputField, resultAsJson, true);
                    
                    // Make sure the status of the response is available in the output message, for error handling
                    resultAsJson.status = res.status;
                    resultAsJson.statusText = res.statusText
                        
                    if (res.ok) {
                        // res.status >= 200 && res.status < 300

                        node.send([msg, null]);
                        
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
                                    if (i > 0) platesAndScores = platesAndScores + ",";
                                    platesAndScores = platesAndScores + resultAsJson.results[i].plate.toUpperCase() + "(" + resultAsJson.results[i].score * 100 + "%)";
                                }
                                
                                node.status({ fill: "blue",shape: "dot",text: platesAndScores });
                                break;
                        }
                    }
                    else {
                        // An application error happened, i.e. we got result from the service but not an optimistic one...
                        // For example we have hit our monthly maximum number of allowed recognitions.
                        node.send([null, msg]);
                        node.status({ fill: "red",shape: "dot",text: resultAsJson.statusText });
                    }
            
                    node.isRecognizing = false;
                })
            })
            .catch( function(err) {
                // A real failure happened, i.e. we even weren't able to get a result from the service...
                node.isRecognizing = false;
                node.error("License plate recognition failed: " + err);
                node.status({fill:"red",shape:"dot",text:"failed"});
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
                res.json().then( function(resultAsJson) {
                    // Store the recognition result (in json format) in the specified output message field
                    RED.util.setMessageProperty(msg, node.outputField, resultAsJson, true);
                    
                    // Make sure the status of the response is available in the output message, for error handling
                    resultAsJson.status = res.status;
                    resultAsJson.statusText = res.statusText
                        
                    if (res.ok) {
                        // res.status >= 200 && res.status < 300

                        node.send([msg, null]);
                        
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
                                    if (i > 0) platesAndScores = platesAndScores + ",";
                                    platesAndScores = platesAndScores + resultAsJson.results[i].plate.toUpperCase() + "(" + resultAsJson.results[i].score * 100 + "%)";
                                }
                                
                                node.status({ fill: "blue",shape: "dot",text: platesAndScores });
                                break;
                        }
                    }
                    else {
                        // An application error happened, i.e. we got result from the service but not an optimistic one...
                        // For example we have hit our monthly maximum number of allowed recognitions.
                        node.send([null, msg]);
                        node.status({ fill: "red",shape: "dot",text: resultAsJson.statusText });
                    }
            
                    node.isRecognizing = false;
                })
            })
            .catch( function(err) {
                // A real failure happened, i.e. we even weren't able to get a result from the service...
                node.isRecognizing = false;
                node.error("License plate recognition failed: " + err);
                node.status({fill:"red",shape:"dot",text:"failed"});
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
