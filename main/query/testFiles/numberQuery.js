var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://18.188.38.42:27017/Driver";

var result = null;
MongoClient.connect(url, function(err, db) {
	if (err) throw err;
	var dbo = db.db("Driver");
	var query = { name: "Chase" };
	result = dbo.collection("drivers").find().toArray(function(err, result) {
		if (err) throw err;
		console.log(result[0].number);
		db.close();
	});
});
