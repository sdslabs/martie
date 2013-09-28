/** Gaana Module */
var r=require('request');
module.exports = function(api_key){
  var api_root = "http://restful.gaana.com/";
  return {
    search: function(query, cb){
      queryURL = api_root+"tracks/search.json?keyword="+query+"&api_key="+api_key;
      r.get(queryURL, function(err, res, body){
        console.log(res.statusCode);
        var response = JSON.parse(body);
        cb(response.tracks);
      })
    }
  }
}