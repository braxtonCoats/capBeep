var driverQuery = require("./driverQuery.js");
var riderQuery = require("./riderQuery.js");

var promise1 = new Promise(function(resolve, reject) {
  setTimeout(function() {
    resolve(val = await driverQuery.popActiveDriver());
  }, 1000);
});

promise1.then(function(value) {
  console.log("Function tester value: " + value);
  // expected output: "foo"
});


//console.log("Testing does pop return num: " + driverQuery.popActiveDriver());
