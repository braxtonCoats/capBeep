var MongoClient = require('mongodb').MongoClient;
module.exports = {
	FindinCol1 : function funk1(callback) {
		MongoClient.connect("mongodb://localhost:27017/Driver", function (err,db) {
			if (err) {
				return console.dir(err);
			}
			var dbo = db.db("Driver");
			dbo.collection("riders").find().toArray(function (err, items) {
				console.log("This is inside the function: " + items[0].number);
				db.close();
				return callback(items[0].number);     
			});
		});
	}
};

