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

// Creates a multimedia message sent to numbers
 var sendMessage = function(params){
  client.Message.send({
    //returns a promise
    from : params.from, //your bandwidth number
    to   : params.to, //number to send to
    text : "This is what I did today :).....dont respond to this",
    media: "https://s3.amazonaws.com/bwdemos/logo.png"
  })

  //calls back the message id number and catches any errors
  .then(function(message){
    console.log(message);
    return client.Message.get(message.id)
    //access ID from json can also get to and from
  })
  // catches any errors
  .catch(function(err){
    console.log(err)
  });
}


var numbers = {
        to: "9802416513",
        from: "9192457257" //bandwidth number
};
sendMessage(numbers);
