// Handles driver queries on the database
// Chase Costner
//

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://18.188.38.42:27017/Driver";

module.exports = {
	// insert a driver into the database
	insertDriver: function(driverName, driverNumber) {
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			var dbo = db.db("Driver");
			var myobj = { name: driverName, number: driverNumber};
			dbo.collection("drivers").insertOne(myobj, function(err, res) {
				if (err) throw err;
				console.log("1 document inserted");
				db.close();
			});
		});
	},

	popActiveDriver: function(){
		var driverNumber = "";
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			var dbo = db.db("Driver");

			// find a driver from the driver collection
			var myobj = dbo.collection("drivers").findOne(function(err, res) {
				if (err) throw err;
				console.log("driver found.");
				db.close();
			});

			console.log(myobj);

			// add the driver to the active collection
			dbo.collection("active").insertOne(myobj, function(err, res) {
				if (err) throw err;
				console.log("driver added to active collection");
				db.close();
			});

			// remove the driver from the driver collection
			dbo.collection("drivers").remove(myobj, function(err, res) {
				if (err) throw err;
				console.log("driver removed from driver collection");
				db.close();
			});
		});
		return driverNumber;
	},

	checkActive: function(num){
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			var dbo = db.db("Driver");
			dbo.collection("active").find({number: num}).toArray(function(err, result) {
				if (err) throw err;
				console.log(result);
				if (result) return true;
				else return false;
				db.close();
			});
		});
	},

	deactivate: function() {
		MongoClient.connect(url, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("Driver");

                        // find a driver from the active collection
                        var myobj = dbo.collection("active").findOne(function(err, res) {
                                if (err) throw err;
                                console.log("active driver found.");
                                db.close();
                        });

                        // add the driver to the active collection
                        dbo.collection("drivers").insertOne(myobj, function(err, res) {
                                if (err) throw err;
                                console.log("driver returned to drivers collection");
                                db.close();
                        });

                        // remove the driver from the driver collection
                        dbo.collection("active").remove(myobj, function(err, res) {
                                if (err) throw err;
                                console.log("driver removed from active collection");
                                db.close();
                        });
                });
	}
}
