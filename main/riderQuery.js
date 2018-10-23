// Handles rider queries on the database
// Chase Costner
//

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

module.exports = {
	// insert a driver into the database
	insertRider: function(riderName, riderNumber) {
		MongoClient.connect(url, function(err, db) {
  			if (err) throw err;
  			var dbo = db.db("Driver");
  			var myobj = { name: riderName, number: riderNumber };
  			dbo.collection("riders").insertOne(myobj, function(err, res) {
    				if (err) throw err;
    				console.log("1 document inserted");
    			db.close();
  			});
		});
	},

	connectDriver: function(riderNumber, driverNum) {
		MongoClient.connect(url, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("Driver");
                        var myquery = {number: riderNumebr};
			var newvalues = { $set: {driverNumber: driverNum } };
                        dbo.collection("riders").updateOne(myquery, newvalues, function(err, res) {        
				if (err) throw err;
                                console.log("1 document inserted");
                        db.close();
                        });
                });
	}
}
