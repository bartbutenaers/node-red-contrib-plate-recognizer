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
    const https = require('https');

    function PlateStatisticsNode(config) {
        RED.nodes.createNode(this, config);
        this.outputField = config.outputField;
                
        var node = this;
        
        node.on("input", function(msg) {
            node.status({fill:"blue",shape:"dot",text:"loading"});
            
            https.get('https://api.platerecognizer.com/v1/statistics/', function(resp) {
                var data = '';

                // A chunk of data has been received.
                resp.on('data', function(chunk) {
                    data += chunk;
                });

                // The whole response has been received...
                resp.on('end', function() {
                    var datatAsJson = JSON.parse(data);
                    
                    // Store the recognition result (in json format) in the specified output message field
                    RED.util.setMessageProperty(msg, node.outputField, datatAsJson, true);
                    
                    node.send(msg);
                });
            }).on("error", function(err) {
                node.status({fill:"red", shape:"dot", text:err.message});
                console.log("Error getting plate statistics: " + err.message);
            });
        });

        node.on("close", function() {
            node.status({ });
        });
    }

    RED.nodes.registerType("plate-statistics", PlateStatisticsNode);
}
