var r=require("request");
var apiRoot="http://restful.gaana.com/";
module.exports = {
  search: function(str, cb){
    var url = apiRoot+"tracks/search.json?keyword="+str+"&api_key=K1234";
    r.get(url, function(err, res, body){
      body = JSON.parse(body);
      cb(body.tracks);
    })
  }
}