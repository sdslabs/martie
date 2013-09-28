var r=require("request");
var apiRoot="https://www.googleapis.com/youtube/v3/";
module.exports = {
	search: function(str, cb){
		var url = apiRoot+"search?q="+str+"&part=snippet&key=AIzaSyCzg8eQVsqLA5Tbwpk5ytGeZqzMgPlFBzg&maxResults=15";
		r.get(url, function(err, res, body){
			body = JSON.parse(body);
			cb(body.items);
		})
	}
}
