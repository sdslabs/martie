var assert = require('assert');
describe("Gaana", function(){
  var gaana = require('../gaana')("K1234");
  it("should return search results", function(){
    gaana.search("Wrecking Ball", function(res){
      assert(res.tracks.length>0);
      console.log(res.tracks.length);
    });
  });
});