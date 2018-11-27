var db1 = require('./db1');
var hi = ""; 

db1.popActiveDriver().then(function(items)  
	console.log(items);
}, function(err) {
  console.error('The promise was rejected', err, err.stack);
});

console.log("Result: " + items);
