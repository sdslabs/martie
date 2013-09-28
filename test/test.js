var assert = require('assert');
describe("Gaana", function(){
  var gaana = require('../gaana')("K1234");
  it("should return search results", function(done){
    gaana.search("Wrecking Ball", function(res){
      assert(res.tracks.length>0);
    });
    gaana.details("1471704", function(res){
      assert(res.length==1);
      assert(res[0].albumname=="Wrecking Ball");
      done();
    });
  });
});

describe("Youtube", function(){
  var yt = require("../youtube");
  it("should return search results", function(){
    yt.search("Daft Punk", function(response){
      assert(response.length>0);
    });
  });
});