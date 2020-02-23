# node-red-contrib-plate-recognizer
A Node-RED node for license plate recognizing via platerecognizer.com

## Install
Run the following npm command in your Node-RED user directory (typically ~/.node-red):
```
npm install node-red-contrib-plate-recognizer
```
Note that you need to ***signup*** for an account on [platerecognizer.com](https://app.platerecognizer.com/start/), and paste your private token into this node's config screen.  With a free account there is a limit to recognize 2500 images per month, but they also offer various paid license models.

## Node usage
This node will detect and recognise license plates in an image, using a deep learning cloud service.  The AI cloud service has been trained for license plates for more than 100 countries.

Send an image (as buffer or base64 encoded string) via an input message, to start a recognition:

![Basic flow](https://user-images.githubusercontent.com/14224149/74985812-88e78f00-5438-11ea-8f5c-790730d77047.png)

```
[{"id":"365dfd56.bee042","type":"plate-recognizer","z":"d9a54719.b13a88","name":"","inputField":"payload","inputFieldType":"msg","outputField":"payload","outputFieldType":"msg","url":"https://api.platerecognizer.com/v1/plate-reader/","x":500,"y":260,"wires":[["30e76c51.f92384"]]},{"id":"c4392f6a.a0f7","type":"inject","z":"d9a54719.b13a88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":120,"y":260,"wires":[["8cf42bca.268018"]]},{"id":"30e76c51.f92384","type":"debug","z":"d9a54719.b13a88","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","x":680,"y":260,"wires":[]},{"id":"8cf42bca.268018","type":"http request","z":"d9a54719.b13a88","name":"","method":"GET","ret":"bin","paytoqs":false,"url":"https://www.mercedes-benz.com/en/classic/history/h-number-plate-2020/_jcr_content/root/paragraph/paragraph-right/paragraphimage/image/MQ6-8-image-20191205151927/02-mercedes-benz-classic-h-number-plate-2020-2560x1440.jpeg","tls":"","persist":false,"proxy":"","authType":"","x":300,"y":260,"wires":[["365dfd56.bee042"]]}]
```

The output message will contain the recognition results (in json format):

![Basic output](https://user-images.githubusercontent.com/14224149/75106301-521d9e80-561b-11ea-89b1-41dbf53bfac6.png)

The *"results*" will be a json array, containing a separate element for each license plate that has been recognised.  When the image contains N cars, then the array will contain N elements.

For each recognised license plate, some basic information will be delivered:

+ *box:* the bounding box (coordinates) where the vehicle is located inside the image.

+ *plate:* the license plate itself as plain text.

+ *region:* the region of the license plate (e.g. *"be"* for Belgium).  This object contains some nested fields:

   ![region](https://user-images.githubusercontent.com/14224149/75106572-7e86ea00-561e-11ea-9491-40f392e5b5b8.png)
   
   + *code:* the region code (from the [region list](http://docs.platerecognizer.com/#regions-supported)).
   + *score:* the confidence level for the region prediction, which is a value between 0 and 1 (with 1 the highest confidence).

+ *vehicle:* information about the vehicle itself.  This object contains some nested fields:

   ![vehicle](https://user-images.githubusercontent.com/14224149/75106701-8abf7700-561f-11ea-92a2-234bf6cc8887.png)

   + *type:* the type of vehicle (which can be Ambulance, Bus, Car, Limousine, Motorcycle, Taxi, Truck, Van, Unknown).
   + *score:* the confidence level for the vehicle prediction, which is a value between 0 and 1 (with 1 the highest confidence).
   + *box:* the bounding box (coordinates) where the vehicle is located inside the image.
   
+ *score:* the confidence level for the license plate text prediction, which is a value between 0 and 1 (with 1 the highest confidence).

+ *candidates:* sometimes the service isn't really sure whether it has recognised the license plate correctly.  Therefore a list of possible plate *'candidates'* will be supplied.  The first candidate is the same plate that has already been offered at the higher level:

   ![image](https://user-images.githubusercontent.com/14224149/75106803-7b8cf900-5620-11ea-8b05-ee94c093f9b7.png)

   In this case the AI service thinks (with 90,3% certainty) that the plate its "s0k92h", but it might be that the plate is "sok92h" (with 90,1% certainty).  In this case the confusion is between the number "0" and the character "o".

+ *dscore:* the confidence level for the license plate detection, which is a value between 0 and 1 (with 1 the highest confidence).

## Node properties
The node can be configured via a series of settings on the config screen:

### Input field
The field of the input message which will need to contain the input image.  By default ```msg.payload``` will be used.  The image should be a binary Buffer or a base64 encoded string.

### Output field
The field of the output message where the recognition result will be stored (in JSON format).  By default ```msg.payload``` will be used.

### API token
Create an account at [platerecogniser.com](https://platerecognizer.com/) and enter your private API token here.

### URL
Specify the URL of the recognition service, to allow different kind of setups:
+ Use the official *cloud service*, which will be the default (and most used) option.
+ Use a *local installation* (based on the SDK).
+ Use a local *Docker container*.

### Status text
Specify how the recognition result needs to be displayed in the node status label:
+ *None:* Show no recognition results.
+ *Plate count:* Show the number of plates that have been recognised in the image.
+ *Plates:* Show a (comma separted) list of the plates that have been recognized in the image.
+ *Plates and scores:* Same as the previous option, but now the 'score' percentage is also added.

### Ignore images arriving during recognition
When selected images will automatically be skipped, when the previous image is still being recognized.  When deselected multiple images can be recognized simultaneously.

### Predict vehicle make and model
When selected not only the plate will be recognized, but there will also be a prediction of the vehicle brand and type.  

CAUTION: this is only supported for some paid account types!

### Only allow specific regions
When selected, an array of region codes can be specified (see [supported regions](http://docs.platerecognizer.com/#regions-supported). 

## Example flow

The following flow explains some different use cases:
+ Image contain a single car.
+ Image containing a single car, but photografed from an angle.  It is important to be able to recognize license plates at angles, because a camera won't always be positioned directly in front of the cars.
+ Image containing two cars, which means the array will contain two individual recognitions.
+ Image containing no cars, which means the array will be empty.
+ Image containing a truck with a license plate, but also some texts on the truck itself.  There will be multiple recognitions in the array (because the texts will also be detected!).

Note that the [node-red-contrib-image-output](https://github.com/rikukissa/node-red-contrib-image-output) node needs to be installed also!

![image](https://user-images.githubusercontent.com/14224149/75100715-d4817080-55d1-11ea-9c64-2dae43df8fe8.png)

```
[{"id":"c4392f6a.a0f7","type":"inject","z":"d9a54719.b13a88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":180,"y":80,"wires":[["8cf42bca.268018"]]},{"id":"30e76c51.f92384","type":"debug","z":"d9a54719.b13a88","name":"Normal recognitions","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"recognition","targetType":"msg","x":820,"y":200,"wires":[]},{"id":"8cf42bca.268018","type":"http request","z":"d9a54719.b13a88","name":"","method":"GET","ret":"bin","paytoqs":false,"url":"https://www.mercedes-benz.com/en/classic/history/h-number-plate-2020/_jcr_content/root/paragraph/paragraph-right/paragraphimage/image/MQ6-8-image-20191205151927/02-mercedes-benz-classic-h-number-plate-2020-2560x1440.jpeg","tls":"","persist":false,"proxy":"","authType":"","x":360,"y":80,"wires":[["1b28085a.576958"]]},{"id":"7ffbc2e9.59702c","type":"inject","z":"d9a54719.b13a88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":180,"y":280,"wires":[["e0d62002.fe834"]]},{"id":"e0d62002.fe834","type":"http request","z":"d9a54719.b13a88","name":"","method":"GET","ret":"bin","paytoqs":false,"url":"https://image.freepik.com/free-photo/empty-parking-lot_1127-3298.jpg","tls":"","persist":false,"proxy":"","authType":"","x":360,"y":280,"wires":[["1b28085a.576958"]]},{"id":"7712131.b1a7bec","type":"comment","z":"d9a54719.b13a88","name":"No cars","info":"","x":150,"y":240,"wires":[]},{"id":"1b28085a.576958","type":"plate-recognizer","z":"d9a54719.b13a88","name":"","inputField":"payload","inputFieldType":"msg","outputField":"recognition","outputFieldType":"msg","url":"https://api.platerecognizer.com/v1/plate-reader/","ignoreDuring":false,"makeAndModel":false,"statusText":"scores","regionFilter":false,"regionList":"","regionListType":"json","x":580,"y":280,"wires":[["30e76c51.f92384","567d08ad.45bfd8"],["95b6f80.d7a9108"]]},{"id":"567d08ad.45bfd8","type":"image","z":"d9a54719.b13a88","name":"Show analyzed image","width":"400","data":"payload","dataType":"msg","thumbnail":false,"active":true,"x":1000,"y":260,"wires":[]},{"id":"548fbfb1.e1d41","type":"inject","z":"d9a54719.b13a88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":180,"y":580,"wires":[["c57cca1d.82a5a8"]]},{"id":"c57cca1d.82a5a8","type":"http request","z":"d9a54719.b13a88","name":"","method":"GET","ret":"bin","paytoqs":false,"url":"https://static.nieuwsblad.be/Assets/Images_Upload/2015/05/24/patton_drivers_2015_1.jpg?maxheight=460&maxwidth=638&scale=both","tls":"","persist":false,"proxy":"","authType":"","x":360,"y":580,"wires":[["1b28085a.576958"]]},{"id":"7e145de0.50ad14","type":"inject","z":"d9a54719.b13a88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":180,"y":380,"wires":[["bdf46a0d.7b4c58"]]},{"id":"bdf46a0d.7b4c58","type":"http request","z":"d9a54719.b13a88","name":"","method":"GET","ret":"bin","paytoqs":false,"url":"http://newscrane.com/wp-content/uploads/2019/09/Car-insurance-Newscrane-02.jpg","tls":"","persist":false,"proxy":"","authType":"","x":360,"y":380,"wires":[["1b28085a.576958"]]},{"id":"be47d8fb.90d608","type":"inject","z":"d9a54719.b13a88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":180,"y":180,"wires":[["4285a683.29a558"]]},{"id":"4285a683.29a558","type":"http request","z":"d9a54719.b13a88","name":"","method":"GET","ret":"bin","paytoqs":false,"url":"http://www.piepenbroek.nl/foto2010/baltisch/IMG_1499.JPG","tls":"","persist":false,"proxy":"","authType":"","x":360,"y":180,"wires":[["1b28085a.576958"]]},{"id":"22132326.f0947c","type":"comment","z":"d9a54719.b13a88","name":"Two cars","info":"","x":160,"y":140,"wires":[]},{"id":"1677bb6f.cfd445","type":"comment","z":"d9a54719.b13a88","name":"One car","info":"","x":150,"y":40,"wires":[]},{"id":"95b6f80.d7a9108","type":"debug","z":"d9a54719.b13a88","name":"Errors","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"recognition","targetType":"msg","x":770,"y":300,"wires":[]},{"id":"bcd5e60.4f93418","type":"comment","z":"d9a54719.b13a88","name":"Truck with labels","info":"","x":180,"y":540,"wires":[]},{"id":"f83c73ff.60e76","type":"comment","z":"d9a54719.b13a88","name":"Car at angle","info":"","x":170,"y":340,"wires":[]},{"id":"3e15dcf3.44e774","type":"inject","z":"d9a54719.b13a88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":180,"y":480,"wires":[["27a318c5.4de638"]]},{"id":"27a318c5.4de638","type":"http request","z":"d9a54719.b13a88","name":"","method":"GET","ret":"bin","paytoqs":false,"url":"https://askautoexperts.com/wp-content/uploads/1931-Dodge-1024x768.jpg","tls":"","persist":false,"proxy":"","authType":"","x":360,"y":480,"wires":[["1b28085a.576958"]]},{"id":"682a68e3.d11598","type":"comment","z":"d9a54719.b13a88","name":"Another car at angle","info":"","x":190,"y":440,"wires":[]}]
```

## Recognition status
The output message will contain the recognition status (and statusText):

![status](https://user-images.githubusercontent.com/14224149/75118670-4f9f6100-567c-11ea-92fa-98d2801f3dc3.png)


+ When the service has finished the recognition without problems, the output message will be send on the *first output* with status 2xx.
+ When the service isn't able to process the recognition, the output message will be send to the *second output* with status 4xx.  The status code will explain what went wrong:
   + 403: Forbidden due to incorrect API token.
   + 413: The payload is too large and exceeds their [upload limits](https://app.platerecognizer.com/upload-limit/).
   + 429: Too many requests have been send in a given amount of time. Upgrade your license for higher number of calls per second.
