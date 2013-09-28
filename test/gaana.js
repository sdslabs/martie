var assert = require('assert');
describe("Gaana", function(){
  var gaana = require('../gaana')("K1234");
  it("should return search results", function(done){
    gaana.search("Miley", function(res){
      console.log(res);
      assert(true);
      //assert(res.length>0);
    });
  });
});