var Bandwidth = require("node-bandwidth");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var http = require("http").Server(app);


var driverQuery = require("./query/driverQuery.js");
var riderQuery = require("./query/riderQuery.js");

// For calling and Hailing a driver
const BWN = '9192457257' // Our Bandwidth Phone number
let maskedNumber = ""; // "Driver" number

const client = new Bandwidth({
  userId    : "u-55edxgbmkvg42t2j6arbnya",
  apiToken  : "t-golha5jlb255oe5xmadkhyq",
  apiSecret : "secwmortbxskvcsruaxqeximdmblybpp6cgnh7i"
});

app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//******* Recieving and sending Messages ************

//set up callback route
app.post("/callback", function(req, res) {
  if (req.body.eventType === "sms") {
    console.log("Incoming msgID: " + req.body.messageId);
    console.log(req.body);
    textRecieved(req, res);
  }
  else {
    console.log(req.body);
  }
  //callback details are stored in req and can be used here
});
// ******** End Of Messaging **********

// ******** Call masking *************
const getBaseUrlFromReq = (req) => {
  return 'http://' + req.hostname;
};
app.post("/", function (req, res) {
  console.log(req);
  res.send("Bandwdith_Forward_A_Call");
});


app.post('/out-call', function (req, res) {
  var this_url2 = getBaseUrlFromReq(req);
  if (req.body.eventType === 'answer') {   //Upon the to-caller answering, bridge the two calls
    console.log("Incoming CallId: " + req.body.tag);
    console.log("Outgoing CallId: " + req.body.callId);
    console.log(req);
    client.Bridge.create({
      bridgeAudio: true,
      callIds : [req.body.tag, req.body.callId]
    })
    .then(function (bridge) {
      console.log("BridgeId: " + bridge.id);
      console.log("---Call has been bridged----");
    })
    .catch(function(err){
      console.log(err);
      console.log("----Could not bridge the call----");
    });
  }
  else if (req.body.eventType === "hangup"){
    console.log(req.body);
    console.log("----Your call has hungup----");
  }
  else{
    console.log(req.body);
  }
});

//INBOUND CALLS
app.post('/in-call', function (req, res) {             //When someone calls the BW number, create call to the to-caller
  if (req.body.eventType === "incomingcall"){
    console.log("Incoming callId: " + req.body.callId);
    var this_url1 = getBaseUrlFromReq(req);
    createCallWithCallback(req.body.to, this_url1, req.body.callId);
  }
  else{
    console.log(req.body);
  }
});

//Method to create outbound call with '/out-call' callback url, tag used to store inbound callId
var createCallWithCallback = function(BWN, this_url, inbound_callid){
  //var driverNum =
  return client.Call.create({
    from: BWN,
    to: maskedNumber,
    callbackUrl: this_url + '/out-call',
    tag: inbound_callid
  })
  .then(function (call) {
    console.log("Outgoing call Id: " + call.callId);
    console.log(call);
    console.log("----Outbound call has been created----");
  })
  .catch(function(err){
    console.log(err);
    console.log("---Outbound call could not be created---");
  })
};

//*********** End of Calling *****************

// *********** Main Text Logic ***************
// textRecieved allows us to determine what a user needs and routing them appropriatly

var textRecieved = function(req, res){
  var incomingMsg = req.body.text;
  console.log("incoming Message: " + incomingMsg);

  // Logic for driver to submit their information about riding
  if (incomingMsg.match(/is driving/gi)) {
    driverNameRecievedText(req, res);
    client.Message.send({
      from: BWN,
      to: req.body.from,
      text: "Thank you for driving! You will recieve a text soon with your first rider!" +
        "Text 'ride complete' once you drop off your rider. \n Type 'done driving' when you finish beeping. "
    }).then(message => console.log(message));
  }
  else if (incomingMsg.match(/help/gi)){
    client.Message.send({
      from: BWN,
      to: req.body.from,
      text: "Use the following commands to request a ride or sign up for driving:\n" +
        "--------------------\n" +
        "'[Your Name] is driving' to sign up to drive\n" +
        "'[Your name] needs a ride' to request a ride"
    }).then(Message => console.log(message));
  }
  else if (incomingMsg.match(/ride complete/gi)){
    driverQuery.deactivate(req.body.from);
    client.Message.send({
      from: BWN,
      to: req.body.from,
      text: "You'll recieve another rider request soon!"
    }).then(message => console.log(message));

  }

  // Logic for a rider to request a driver
  else if (incomingMsg.match(/ride/gi)){
    checkDrivers(req, res);
    //riderNameRecievedText(req, res);
    //assignDriverToRider(req, res);
  }
  else if (incomingMsg.match(/need/gi)){
    client.Message.send({
      from: BWN,
      to: req.body.from,
      text: "Resond with '(needs) needs a ride'"
    }).then(message => console.log(message));
  }

  // Driver isn't drivning anymore
  else if (incomingMsg.match(/done driving/gi)){
    driverQuery.removeDriver(req.body.from);
    client.Message.send({
      from: BWN,
      to: req.body.from,
      text: "Thanks for driving!"
    }).then(message => console.log(message));
  }

  // Command not understood
  else {
    client.Message.send({
      from: BWN,
      to: req.body.from,
      text: "Message not understood, reply 'help' for a list of commands"
    }).then(message => console.log(message));
  }

  // Logic for Driver completing a ride
}
// ************ End of Text Logic ********************

// ************ Text Helper methods ******************
var driverNameRecievedText = function(req, res) {
  var incomingmsg = req.body.text;
  var response = incomingmsg.split(" ");
  var name = response[0];
  var number = req.body.from;
  driverQuery.insertDriver(name, number);
  console.log("driver name is: " + name);
};

var riderNameRecievedText = function(req, res) {
  var incomingmsg = req.body.text;
  var response = incomingmsg.split(" ");
  var name = response[0];
  var number = req.body.from;
  riderQuery.insertRider(name, number);
  console.log("rider name is: " + name);
};

var checkDrivers = function(req, res) {
  driverQuery.driversAvailable(function(available) {
    if (available == false){
    client.Message.send ({
      from: BWN,
      to: req.body.from,
      text: "No drivers available at this time, please try again later"
    }).then(message => console.log(message));
    }
    else if (available == true){
    riderNameRecievedText(req, res);
      assignDriverToRider(req, res);
    }
  })
}
var assignDriverToRider = function(req, res) {

  //riderQuery.connectDriver(req.body.from, driverQuery.popActiveDriver());
  driverQuery.popActiveDriver(function(driverNumItem) {
          riderQuery.connectDriver(req.body.from, driverNumItem);
          maskedNumber = driverNumItem;
          driverQuery.getDriverName(driverNumItem, function(driverNameItem) {
    // NESTCODE FOR SENDING TEXT MESSAGE
  var driverName = driverNameItem;
    client.Message.send ({
      from: BWN,
      to: req.body.from,
      text: driverNameItem + ", your driver, is on the way! Your driver needs your location so call this number to speak with them"
    }).then(message => console.log(message));
    // reference name via "driverNameItem" variable

    driverQuery.getRiderName(driverNumItem, function(riderNameItem) {
        // NESTCODE FOR SENDING TEXT MESSAGE
        // reference num via "riderNameItem" variable
        riderName = riderNameItem//fuction call
        riderLocation =
        client.Message.send ({
          from: BWN,
          to: maskedNumber,
          text: riderName + " is ready to be picked up!"
        }).then(message => console.log(message));
    });

});
//}
  //here, add the code that sends the text message
  });
  //var driverName = riderQuery.getDriverName(req.body.from);
  //textDriver(req, res, maskedNumber);

}
// ************* End of text helper methods ***********

// Listen - indicates programming running
http.listen(app.get('port'), function() {
  console.log("App listening on PORT " + app.get('port'));
});
