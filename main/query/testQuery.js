var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://18.188.38.42:27017/Driver";

var driverNumber = "";

MongoClient.connect(url, function(err, db) {
	if (err) throw err;
	var dbo = db.db("Driver");

	console.log("Popping an active driver...");

	// find a driver from the driver collectionI
	var myobj = dbo.collection("drivers").find().toArray(function(err, res) {
		if (err) throw err;
		console.log("from within the bowels" + res[2].name);
		console.log("driver found.");
	});

	console.log("The obj is: " + myobj);
	
	// add the driver to the active collection
});

