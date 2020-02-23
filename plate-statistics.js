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

    function PlateStatisticsNode(config) {
        RED.nodes.createNode(this, config);
        this.url         = config.url;
        this.outputField = config.outputField;
                
        var node = this;
        
        node.on("input", function(msg) {
            node.status({fill:"blue",shape:"dot",text:"loading"});
            
            fetch(node.url, {
                method: 'GET',
                headers: {
                    "Authorization": "Token " + node.credentials.apiToken
                }
            }).then( function(res) {
                res.json().then( function(resultAsJson) {
                    // Store the statistics result (in json format) in the specified output message field
                    RED.util.setMessageProperty(msg, node.outputField, resultAsJson, true);
                    node.send(msg);
                    node.status({ });
                })
            })
        });

        node.on("close", function() {
            node.status({ });
        });
    }

    RED.nodes.registerType("plate-statistics", PlateStatisticsNode, {
        credentials: {
            apiToken: {type: "password"}
        }
    });
}
