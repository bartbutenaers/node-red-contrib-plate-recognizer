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
        this.url = config.url;
        this.inputField = config.inputField;
        this.outputField = config.outputField;

        var node = this;
        
        node.on("input", function(msg) {
            // Get the image specified in the input message
            var image = RED.util.getMessageProperty(msg, node.inputField);

            // Make sure all images are base64 encoded
            if (Buffer.isBuffer(image)) {
                image = image.toString("base64");
            }
            
            var body = new FormData();
            body.append('upload', image);

            // Pass the base64 encoded image to the cloud (or docker) service 
            fetch(node.url, {
                method: 'POST',
                headers: {
                    "Authorization": "Token " + node.credentials.apiToken
                },
                body: body
            }).then(res => res.json())
            .then(resultAsJson => {
                // Store the recognition result (in json format) in the specified output message field
                RED.util.setMessageProperty(msg, node.outputField, resultAsJson, true);
                node.send(msg);
            })
            .catch((err) => {
                console.log(err);
            });
        });

        node.on("close", function() {
            node.status({ });
        });
    }

    RED.nodes.registerType("plate-recognizer", PlateRecognizerNode, {
        credentials: {
            apiToken: {type: "password"}
        }
    });
}
