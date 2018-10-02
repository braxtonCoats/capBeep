var Bandwidth = require("node-bandwidth");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var http = require("http").Server(app);
const BWN = '8282634970' // Our Bandwidth Phone number 
let maskedNumber = "9802416513";

const client = new Bandwidth({
  userId    : "u-i6gl7dfuqapkbzmuqfz2day",
  apiToken  : "t-kwfvokb5uy5w7mooyheqawy",
  apiSecret : "tfhex5vvlocvqi7nohqlcl4etterfepxytd2wfq"
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
    client.Message.send ({
      from: BWN,
      to: req.body.from,
      text: "Message recieved"
    }).then(message => console.log(message));
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
//listen
http.listen(app.get('port'), function() {
    console.log("App listening on PORT " + app.get('port'));
});
