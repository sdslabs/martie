var assert = require('assert');
describe("Gaana", function(){
  var gaana = require('../gaana')("K1234");
  it("should return search results", function(done){
    gaana.search("Wrecking Ball", function(res){
      assert(res.tracks.length>0);
      console.log(res.tracks.length);
    });

    gaana.details("1471704", function(res){
      assert(res.length==1);
      assert(res[0].albumname=="Wrecking Ball");
      done();
    });
  });
});