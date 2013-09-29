var r=require("request");
var apiRoot="https://www.googleapis.com/youtube/v3/";
module.exports = {
  search: function(str, cb){
    var url = apiRoot+"search?q="+str+"&part=snippet&key=AIzaSyCzg8eQVsqLA5Tbwpk5ytGeZqzMgPlFBzg&maxResults=15";
    r.get(url, function(err, res, body){
      body = JSON.parse(body);
      cb(body.items);
    })
  },
  length: function(id, cb){
  	var url = "https://gdata.youtube.com/feeds/api/videos/"+id+"?v=2&alt=jsonc";
  	r.get(url, function(err, res, body){
  		var response = JSON.parse(body);
  		cb(response.data.duration);
  	});
  }
}
