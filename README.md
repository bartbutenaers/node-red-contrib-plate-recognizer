# node-red-contrib-plate-recognizer
A Node-RED node for license plate recognizing via [platerecognizer.com](https://app.platerecognizer.com/)

## Install
Run the following npm command in your Node-RED user directory (typically ~/.node-red):
```
npm install node-red-contrib-plate-recognizer
```
Note that you need to ***signup*** for an account on [platerecognizer.com](https://app.platerecognizer.com/start/), and paste your private token into this node's config screen.  With a free account there is a limit to recognize 2500 images per month, but they also offer various paid license models.

## Support my Node-RED developments

Please buy my wife a coffee to keep her happy, while I am busy developing Node-RED stuff for you ...

<a href="https://www.buymeacoffee.com/bartbutenaers" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy my wife a coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

## Node usage
This node will detect and recognise license plates in an image, using a deep learning (cloud) service.  The AI (cloud) service has been trained for license plates for more than 100 countries.  They also offer an [SDK](http://docs.platerecognizer.com/#sdk) for local setups, which can easily be installed as a Docker container.  See also our [blog](https://platerecognizer.com/blog/anpr-on-node-red/) for an introduction.

:warning: When you have an image with an ***incorrect recognition*** result, don't hesitate to contact the people of [platerecognizer.com](https://app.platerecognizer.com/)!  They offer great support.  When you provide them the image, they will analyse it and try to solve the problem.  This way the system can become better and better ...

Send an image (as buffer or base64 encoded string) via an input message, to start a recognition:

![Basic flow](https://user-images.githubusercontent.com/14224149/74985812-88e78f00-5438-11ea-8f5c-790730d77047.png)

```
[{"id":"38586517.a5bf9a","type":"plate-recognizer","z":"d9a54719.b13a88","name":"","inputField":"payload","inputFieldType":"msg","outputField":"payload","outputFieldType":"msg","url":"https://api.platerecognizer.com/v1/plate-reader/","ignoreDuring":false,"makeAndModel":false,"statusText":"none","cameraId":"","regionFilter":false,"timestamp":false,"regionList":"","regionListType":"json","x":880,"y":660,"wires":[["30cb89da.c35546"],[]]},{"id":"e4699284.081c7","type":"inject","z":"d9a54719.b13a88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":500,"y":660,"wires":[["9e2c9295.7f9a9"]]},{"id":"30cb89da.c35546","type":"debug","z":"d9a54719.b13a88","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","x":1060,"y":660,"wires":[]},{"id":"9e2c9295.7f9a9","type":"http request","z":"d9a54719.b13a88","name":"","method":"GET","ret":"bin","paytoqs":false,"url":"https://www.mercedes-benz.com/en/classic/history/h-number-plate-2020/_jcr_content/root/paragraph/paragraph-right/paragraphimage/image/MQ6-8-image-20191205151927/02-mercedes-benz-classic-h-number-plate-2020-2560x1440.jpeg","tls":"","persist":false,"proxy":"","authType":"","x":680,"y":660,"wires":[["38586517.a5bf9a"]]}]
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

### Camera ID
Optionally a camera id can be specified, which will be sent to the recognition service.

### Status text
Specify how the recognition result needs to be displayed in the node status label:
+ *None:* Show no recognition results.
+ *Plate count:* Show the number of plates that have been recognised in the image.
+ *Plates:* Show a (comma separted) list of the plates that have been recognized in the image.
+ *Plates and scores:* Same as the previous option, but now the 'score' percentage is also added.

### Ignore images arriving during recognition
When selected images will automatically be skipped, when the previous image is still being recognized.  When deselected multiple images can be recognized simultaneously.

### Predict vehicle make and model (MMC)
When selected not only the plate will be recognized, but there will also be a prediction of the vehicle brand and type.  

CAUTION: this is only supported for some paid account types!

### Send separate message for each plate:
When selected a separate output message will be send for each recognized license plate.  If not selected a single output message will be send containing an array of ALL recognized license plates.  See the section *"Split output messages"* below for more information.

### Specify one or more regions
When selected, an array of region codes can be specified (see [supported regions](http://docs.platerecognizer.com/#regions-supported). 

## Example flow (different cases)

The following flow explains some different use cases:
+ Image contain a single car.
+ Image containing a single car, but photografed from an angle.  It is important to be able to recognize license plates at angles, because a camera won't always be positioned directly in front of the cars.
+ Image containing two cars, which means the array will contain two individual recognitions.
+ Image containing no cars, which means the array will be empty.
+ Image containing a truck with a license plate, but also some texts on the truck itself.  There will be multiple recognitions in the array (because the texts will also be detected!).

Note that the [node-red-contrib-image-output](https://github.com/rikukissa/node-red-contrib-image-output) node needs to be installed also!

![image](https://user-images.githubusercontent.com/14224149/75100715-d4817080-55d1-11ea-9c64-2dae43df8fe8.png)

```
[{"id":"fff72ad.6f8c7d8","type":"inject","z":"d9a54719.b13a88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":920,"y":460,"wires":[["ee55dd94.02b2e"]]},{"id":"28523886.f82428","type":"debug","z":"d9a54719.b13a88","name":"Normal recognitions","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"recognition","targetType":"msg","x":1560,"y":580,"wires":[]},{"id":"ee55dd94.02b2e","type":"http request","z":"d9a54719.b13a88","name":"","method":"GET","ret":"bin","paytoqs":false,"url":"https://www.mercedes-benz.com/en/classic/history/h-number-plate-2020/_jcr_content/root/paragraph/paragraph-right/paragraphimage/image/MQ6-8-image-20191205151927/02-mercedes-benz-classic-h-number-plate-2020-2560x1440.jpeg","tls":"","persist":false,"proxy":"","authType":"","x":1100,"y":460,"wires":[["231d72b4.5233ae"]]},{"id":"10f189ae.db2d76","type":"inject","z":"d9a54719.b13a88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":920,"y":660,"wires":[["24464bb6.a07b64"]]},{"id":"24464bb6.a07b64","type":"http request","z":"d9a54719.b13a88","name":"","method":"GET","ret":"bin","paytoqs":false,"url":"https://image.freepik.com/free-photo/empty-parking-lot_1127-3298.jpg","tls":"","persist":false,"proxy":"","authType":"","x":1100,"y":660,"wires":[["231d72b4.5233ae"]]},{"id":"5ee1acd5.4e0784","type":"comment","z":"d9a54719.b13a88","name":"No cars","info":"","x":890,"y":620,"wires":[]},{"id":"231d72b4.5233ae","type":"plate-recognizer","z":"d9a54719.b13a88","name":"","inputField":"payload","inputFieldType":"msg","outputField":"recognition","outputFieldType":"msg","url":"https://api.platerecognizer.com/v1/plate-reader/","ignoreDuring":false,"makeAndModel":false,"statusText":"scores","cameraId":"","regionFilter":false,"timestamp":false,"regionList":"","regionListType":"json","x":1320,"y":660,"wires":[["28523886.f82428","37b1b695.62fa4a"],["100a66ab.4607f9"]]},{"id":"37b1b695.62fa4a","type":"image","z":"d9a54719.b13a88","name":"Show analyzed image","width":"400","data":"payload","dataType":"msg","thumbnail":false,"active":true,"x":1740,"y":640,"wires":[]},{"id":"869cd924.d991d8","type":"inject","z":"d9a54719.b13a88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":920,"y":960,"wires":[["f6b6ac8f.40806"]]},{"id":"f6b6ac8f.40806","type":"http request","z":"d9a54719.b13a88","name":"","method":"GET","ret":"bin","paytoqs":false,"url":"https://static.nieuwsblad.be/Assets/Images_Upload/2015/05/24/patton_drivers_2015_1.jpg?maxheight=460&maxwidth=638&scale=both","tls":"","persist":false,"proxy":"","authType":"","x":1100,"y":960,"wires":[["231d72b4.5233ae"]]},{"id":"6ac3b436.692fac","type":"inject","z":"d9a54719.b13a88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":920,"y":760,"wires":[["d2c4249d.901fd8"]]},{"id":"d2c4249d.901fd8","type":"http request","z":"d9a54719.b13a88","name":"","method":"GET","ret":"bin","paytoqs":false,"url":"http://newscrane.com/wp-content/uploads/2019/09/Car-insurance-Newscrane-02.jpg","tls":"","persist":false,"proxy":"","authType":"","x":1100,"y":760,"wires":[["231d72b4.5233ae"]]},{"id":"9a21e444.b22fc8","type":"inject","z":"d9a54719.b13a88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":920,"y":560,"wires":[["8e81e18d.39882"]]},{"id":"8e81e18d.39882","type":"http request","z":"d9a54719.b13a88","name":"","method":"GET","ret":"bin","paytoqs":false,"url":"http://www.piepenbroek.nl/foto2010/baltisch/IMG_1499.JPG","tls":"","persist":false,"proxy":"","authType":"","x":1100,"y":560,"wires":[["231d72b4.5233ae"]]},{"id":"5899f099.1b645","type":"comment","z":"d9a54719.b13a88","name":"Two cars","info":"","x":900,"y":520,"wires":[]},{"id":"1db8bd98.23d672","type":"comment","z":"d9a54719.b13a88","name":"One car","info":"","x":890,"y":420,"wires":[]},{"id":"100a66ab.4607f9","type":"debug","z":"d9a54719.b13a88","name":"Errors","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"recognition","targetType":"msg","x":1510,"y":680,"wires":[]},{"id":"cdfaa780.c2fa18","type":"comment","z":"d9a54719.b13a88","name":"Truck with labels","info":"","x":920,"y":920,"wires":[]},{"id":"c1d2f038.82ecc","type":"comment","z":"d9a54719.b13a88","name":"Car at angle","info":"","x":910,"y":720,"wires":[]},{"id":"8c4f0d01.426a2","type":"inject","z":"d9a54719.b13a88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":920,"y":860,"wires":[["7b580c6e.105764"]]},{"id":"7b580c6e.105764","type":"http request","z":"d9a54719.b13a88","name":"","method":"GET","ret":"bin","paytoqs":false,"url":"https://askautoexperts.com/wp-content/uploads/1931-Dodge-1024x768.jpg","tls":"","persist":false,"proxy":"","authType":"","x":1100,"y":860,"wires":[["231d72b4.5233ae"]]},{"id":"da494e5a.e21ff","type":"comment","z":"d9a54719.b13a88","name":"Another car at angle","info":"","x":930,"y":820,"wires":[]}]
```

## Recognition status
The output message will contain the recognition status (and statusText):

![status](https://user-images.githubusercontent.com/14224149/75118670-4f9f6100-567c-11ea-92fa-98d2801f3dc3.png)


+ When the service has finished the recognition without problems, the output message will be send on the *first output* with status 2xx.
+ When the service isn't able to process the recognition, the output message will be send to the *second output* with status 4xx.  The status code will explain what went wrong:
   + 403: Forbidden due to incorrect API token.
   + 413: The payload is too large and exceeds their [upload limits](https://app.platerecognizer.com/upload-limit/).
   + 429: Too many requests have been send in a given amount of time. Upgrade your license for higher number of calls per second.

## Plate statistics
Since the number of recognitions per month is limited (e.g. 2500 for a free account), it is very useful to determine from time to time how many recognitions are left.  This way you can avoid situations where you are not aware that you have run out of recognitions...

A second node (*"Plate statistics"*) has been provided to get the statistics of your account (with *'URL'* and *'API token'* settings identical as described above):

![Statistics flow](https://user-images.githubusercontent.com/14224149/75119790-6cd92d00-5686-11ea-806d-d755b27eb8d6.png)

```
[{"id":"9b354f46.f081d","type":"plate-statistics","z":"d9a54719.b13a88","name":"","outputField":"payload","outputFieldType":"msg","url":"https://api.platerecognizer.com/v1/statistics/","x":980,"y":480,"wires":[["54063a77.493ae4"]]},{"id":"5653b69.13c4648","type":"inject","z":"d9a54719.b13a88","name":"Get statistics","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":770,"y":480,"wires":[["9b354f46.f081d"]]},{"id":"54063a77.493ae4","type":"debug","z":"d9a54719.b13a88","name":"Plate statistics","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","x":1190,"y":480,"wires":[]}]
```
The resulting statistics (in json format) contain the maximum number of statistics, and also the used number of statistics of the current month:

![Statistics output](https://user-images.githubusercontent.com/14224149/75119816-a3af4300-5686-11ea-9a7d-fb9a8292b823.png)

## Split output messages
When the input message contains multiple license plates, then the output message will contain an ***array*** of license plates.  Since not all Node-RED nodes can handle arrays as input, it might be required to split the array into separate items.  In other words the single output message (containing an array of N license plates) need to be split into N separate output messages (each one containing a single license plate).

CAUTION: to avoid conflicts, the original input message will be ***cloned*** N times.  But since the output message also contains the input image, that input image will also be cloned N times.  As a result extra system resources (CPU and memory) will be used!

### Using a Split node
The Split node is a Node-RED core node that can be used to split a single message into multiple messages:

![Split node flow](https://user-images.githubusercontent.com/14224149/77010195-9f1a3980-6969-11ea-99e8-112c4b3ea351.png)

```
[{"id":"ef944a38.bbef38","type":"plate-recognizer","z":"c8a948fc.76ade8","name":"","inputField":"payload","inputFieldType":"msg","outputField":"payload","outputFieldType":"msg","url":"https://api.platerecognizer.com/v1/plate-reader/","ignoreDuring":true,"makeAndModel":false,"statusText":"count","cameraId":"","regionFilter":false,"regionList":"[]","regionListType":"json","x":780,"y":500,"wires":[["78a775a2.7e37cc","60071b7.6a1cae4"],[]]},{"id":"2e44447f.4e42dc","type":"split","z":"c8a948fc.76ade8","name":"Split array","splt":"\\n","spltType":"str","arraySplt":1,"arraySpltType":"len","stream":false,"addname":"","x":1220,"y":500,"wires":[["745a5d4a.ff4e34"]]},{"id":"5a39a5a9.55c97c","type":"http request","z":"c8a948fc.76ade8","name":"Get video stream","method":"GET","ret":"bin","paytoqs":false,"url":"http://www.piepenbroek.nl/foto2010/baltisch/IMG_1499.JPG","tls":"","persist":false,"proxy":"","authType":"","x":570,"y":500,"wires":[["ef944a38.bbef38","dad27e21.9ab27"]]},{"id":"dad27e21.9ab27","type":"image","z":"c8a948fc.76ade8","name":"","width":"400","data":"payload","dataType":"msg","thumbnail":false,"active":true,"x":780,"y":580,"wires":[]},{"id":"745a5d4a.ff4e34","type":"debug","z":"c8a948fc.76ade8","name":"Show messages","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","x":1380,"y":500,"wires":[]},{"id":"15ee9680.b977ea","type":"inject","z":"c8a948fc.76ade8","name":"Start the test","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":370,"y":500,"wires":[["5a39a5a9.55c97c"]]},{"id":"78a775a2.7e37cc","type":"change","z":"c8a948fc.76ade8","name":"payload = payload.results","rules":[{"t":"set","p":"payload","pt":"msg","to":"payload.results","tot":"msg"}],"action":"","property":"","from":"","to":"","reg":false,"x":1010,"y":500,"wires":[["2e44447f.4e42dc"]]},{"id":"60071b7.6a1cae4","type":"debug","z":"c8a948fc.76ade8","name":"Show messages","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","x":980,"y":440,"wires":[]}]
```
The flow explained step by step:

1.	Start the flow by pressing the button on the Inject-node
2.	The second node gets an image (e.g. via a http request from an ip camera)
3.	In the image-preview node you can see that the image contains two license plates
4.	The plate recognizer node detects two plates
5.	Via a debug node you can see the json output: it is a single message containing an array of two license plates. 
6.	I move the payloads.result field to the payload field (because the next node expects the array in the payload field).
7.	The split node splits the array in the payload, which means the single message will be splitted in two separate messages.
8.	With a debug node you will see that we now have two separate messages, each one containing a single license plate (which can now be handled easily by other nodes in the flow...).

### Using the build-in splitter
Since the Split node will cause our flow to become a bit more complex, this node offers a build-in split functionality.  When the *"Send separate message for each plate"* checkbox is activated, an input image (containing N license plates) will result in N output messages (each one containing a single license plate).

Edge case: when the input message contains *NO* license plate, then a single output message will be sent containing an *empty* result:

![Empty result](https://user-images.githubusercontent.com/14224149/77010828-da693800-696a-11ea-8e64-637e9661ab8a.png)

Remark: in the latter case, we could have decided to send no output message (since no license plate has been detected).  But when somebody sends a picture to the input, he will expect something back ...
