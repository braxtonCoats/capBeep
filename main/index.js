var Bandwidth = require("node-bandwidth");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var http = require("http").Server(app);

// Connecting to Database
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://18.188.38.42:27017/Driver";

var driverQuery = require("./query/driverQuery.js");
var riderQuery = require("./query/riderQuery.js");

// For calling and Hailing a driver
const BWN = '9192457257' // Our Bandwidth Phone number
let maskedNumber = "9802416513"; // "Driver" number

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
    //callback details are stored in req
    //and can be used here
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
    if (req.body.eventType === 'answer') {                    //Upon the to-caller answering, bridge the two calls
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

var textRecieved = function(req, res){
	  var incomingMsg = req.body.text;
	  console.log("incoming Message: " + incomingMsg);

// Logic for driver to submit their information about riding
    if (incomingMsg.match(/driving/gi)) {
	client.Message.send({
		from: BWN,
		to: req.body.from,
		text: "Respond with 'My name is _______"
	}).then(message => console.log(message));
    }
    else if (incomingMsg.match(/name/gi)){
	    driverNameRecievedText(req, res);
	client.Message.send({
		from: BWN,
		to: req.body.from,
      		text: "Thank you for driving! You will recieve a text soon with your first rider!"
	}).then(message => console.log(message));
	}



// Logic for a rider to request a driver
    else if (incomingMsg.match(/ride/gi)){
		riderNameRecievedText(req, res);
    		client.Message.send ({
      from: BWN,
      to: req.body.from,
      text: "Your driver is Chase, they're on the way!"
    }).then(message => console.log(message));
    }
    else if (incomingMsg.match(/need/gi)){
	client.Message.send({
		from: BWN,
		to: req.body.from,
		text: "Resond with '________ needs a ride'"
	}).then(message => console.log(message));

	}

}

var driverNameRecievedText = function(req, res) {
	var incomingmsg = req.body.text;
	    var response = incomingmsg.split(" ");
	    var name = response[response.length - 1];
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
//*********** End of Calling *****************

// Finding Chase out of the Database ********* NON-FUNCTIONING **************
var searchDriverNumber = function(){
var dNum = "";
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("Driver");
  var query = { name: "Braxton" };
  var result = dbo.collection("drivers").find(query).toArray(function(err, result) {
    if (err) throw err;

    console.log(result[0].number);
    dNum = result[0].number;
    return result[0].number;
  });
});
    return result[0].number;
};

//listen
http.listen(app.get('port'), function() {
    console.log("App listening on PORT " + app.get('port'));
});
