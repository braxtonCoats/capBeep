// Handles driver queries on the database
// Chase Costner
//

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://18.188.38.42:27017/Driver"

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

	// get the name of the 
	getDriverName: function(num) driverNameFunc(callback) { 
		MongoClient.connect(url, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("Driver");
                        dbo.collection("active").find({number: num}).toArray(function(err, result) {
                                if (err) throw err;
                                db.close();
				return callback(retult[0].name);
                        });
                });
	},

	// pop an active driver from the database and return their phone number
	popActiveDriver: function popFunc(callback) {
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;

			var dbo = db.db("Driver");
			var myobj;

			console.log("Popping an active driver...");

			// find a driver from the driver collection
			dbo.collection("drivers").find().toArray(function(err, result) {
				if (err) throw err;
				driverNumber = result[0].number;
				myobj = result[0];
				console.log("The driver's number is: " + driverNumber);
				

				dbo.collection("active").insertOne(myobj, function(err, res) {
					if (err) throw err;
					console.log("driver added to active collection");
				});

				// remove the driver from the driver collection
				dbo.collection("drivers").deleteOne(myobj, function(err, res) {
					if (err) throw err;
					console.log("driver removed from driver collection");
					db.close();
				});

				return callback(result[0].number);
			});
		});
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

	deactivate: function(num) {
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			var dbo = db.db("Driver");

			// find the driver in the active collection
			result = dbo.collection("active").find({number: num}).toArray((function(err, res) {
				if (err) throw err;
				myobj = res[0];
				console.log("active driver found.");
				dbo.collection("drivers").insertOne(myobj, function(err, res) {
					if (err) throw err;
					console.log("driver returned to drivers collection");
				});

				// remove the driver from the driver collection
				dbo.collection("active").remove(myobj, function(err, res) {
					if (err) throw err;
					console.log("driver removed from active collection");
					db.close();
				});
			}));

		});
	}
}
