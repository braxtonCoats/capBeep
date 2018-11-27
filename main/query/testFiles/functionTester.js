var driverQuery = require("./driverQuery.js");
var riderQuery = require("./riderQuery.js");

//var promise1 = new Promise(function(resolve, reject) {
//  setTimeout(function() {
//    resolve(val = driverQuery.popActiveDriver());
//  }, 1000);
//});

//promise1.then(function(value) {
//  console.log("Function tester value: " + value);
//  // expected output: "foo"
//});


driverQuery.popActiveDriver().then(function(items) {
  console.info('Testing does pop return num: ', items);
}, function(err) {
  console.error('The promise was rejected', err, err.stack);
});
//console.log("Testing does pop return num: " + driverQuery.popActiveDriver());    //do what you need here
