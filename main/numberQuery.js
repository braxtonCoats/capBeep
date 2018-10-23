var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


var num = searchNum();
//console.log(num);

module.exports = {
 sayHello: function() {
	console.log("hello");
}
}

function searchNum() {
	var result = null;
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db("Driver");
		var query = { name: "Braxton" };
		result = dbo.collection("drivers").find(query).toArray(function(err, result) {

			if (err) throw err;
			res =  result[0].name;
			return res;
			db.close();
		});
	});
};

searchNum(function(res){console.log(res);});

