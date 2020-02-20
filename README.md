# node-red-contrib-plate-recognizer
A Node-RED node for license plate recognizing via platerecognizer.com

## Install
Run the following npm command in your Node-RED user directory (typically ~/.node-red):
```
npm install node-red-contrib-plate-recognizer
```

## Node usage

![Example flow](https://user-images.githubusercontent.com/14224149/74985812-88e78f00-5438-11ea-8f5c-790730d77047.png)

```
[{"id":"365dfd56.bee042","type":"plate-recognizer","z":"d9a54719.b13a88","name":"","inputField":"payload","inputFieldType":"msg","outputField":"payload","outputFieldType":"msg","url":"https://api.platerecognizer.com/v1/plate-reader/","x":500,"y":260,"wires":[["30e76c51.f92384"]]},{"id":"c4392f6a.a0f7","type":"inject","z":"d9a54719.b13a88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":120,"y":260,"wires":[["8cf42bca.268018"]]},{"id":"30e76c51.f92384","type":"debug","z":"d9a54719.b13a88","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","x":680,"y":260,"wires":[]},{"id":"8cf42bca.268018","type":"http request","z":"d9a54719.b13a88","name":"","method":"GET","ret":"bin","paytoqs":false,"url":"https://www.mercedes-benz.com/en/classic/history/h-number-plate-2020/_jcr_content/root/paragraph/paragraph-right/paragraphimage/image/MQ6-8-image-20191205151927/02-mercedes-benz-classic-h-number-plate-2020-2560x1440.jpeg","tls":"","persist":false,"proxy":"","authType":"","x":300,"y":260,"wires":[["365dfd56.bee042"]]}]
```

The result will be a recognition in json format:

![Json output](https://user-images.githubusercontent.com/14224149/74986050-1b882e00-5439-11ea-9da7-d1f21147718b.png)
