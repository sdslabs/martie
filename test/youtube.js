var assert = require('assert');
describe("Youtube", function(){
  var yt = require("../youtube");
  it("should return search results", function(){
    yt.search("Daft Punk", function(response){
      assert(response.length>0);
    });
  });
});