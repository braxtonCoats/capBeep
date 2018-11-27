var driverQuery = require("../driverQuery.js");
var riderQuery = require("../riderQuery.js");

driverQuery.getDriverName("+19802416513", function(driverNameItem) {
	console.log("The name of the driver is " + driverNameItem);
});
