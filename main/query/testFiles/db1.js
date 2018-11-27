// db1.js
var MongoClient = require('mongodb').MongoClient;

module.exports = {


	popActiveDriver: function() {
		return MongoClient.connect('mongodb://localhost:27017/Driver').then(function(db) {
			var dbo = db.db("Driver");
			return dbo.collection("riders").find().toArray();

		}).then(function(items) {
			return items[0].number;
		});
	}
};
