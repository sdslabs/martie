/** Gaana Module */
var r=require('request');
module.exports = function(api_key){
  var api_root = "http://restful.gaana.com/";
  return {
    search: function(query, cb){
      queryURL = api_root+"tracks/search.json?keyword=wrecking+ball&api_key"+api_key;
      r.get(queryURL, function(res){
        cb(res);
      })
    },
    details: function(trackId, cb){
      queryURL = api_root+"tracks/details.json/"+trackId+"?api_key="+api_key;
      r.get(queryURL, function(res){
        cb(res);
      })
    }
  }
}