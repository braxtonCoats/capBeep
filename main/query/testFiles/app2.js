var db2 = require('./db2');


var hello = "";
db2.FindinCol1(function(items) {
  console.log(items);
});

