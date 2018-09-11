var Bandwidth = require("node-bandwidth");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var http = require("http").Server(app);

var client = new Bandwidth({
  userId    : "u-55edxgbmkvg42t2j6arbnya",
  apiToken  : "t-golha5jlb255oe5xmadkhyq",
  apiSecret : "secwmortbxskvcsruaxqeximdmblybpp6cgnh7i"
});

app.use(bodyParser.json());
app.set('port', (process.env.PORT || 3000));

http.listen(app.get('port'), function(){
    console.log('listening on *: ' + app.get('port'));
});

const getBaseUrlFromReq = (req) => {
    return 'http://' + req.hostname;
};
app.post("/", function (req, res) {
    console.log(req);
    res.send("Bandwdith_Forward_A_Call");
});

let FromBWnumber = "9192457257";
let toNumber = "9802416513";

//OUTBOUND CALLS
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
var createCallWithCallback = function(FromBWnumber, this_url, inbound_callid){
    return client.Call.create({
        from: FromBWnumber,
        to: toNumber,
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





/*var numbers = {
        to: "9802416513",
        from: "9192457257" //bandwidth number
};

client.Call.create({
    from: "9192457257",
    to: "9192591068",
    callbackUrl: "http://1136ad2a.ngrok.io"
})
.then(function (id) {
    console.log();
})*/
