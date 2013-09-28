var assert = require('assert');
describe("Gaana", function(){
  var gaana = require('../gaana');
  it("should return search results", function(done){
    gaana.search("Miley", function(res){
      assert(res.length>0);
    });
  });
});