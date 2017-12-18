var should = require("should");
var request = require("supertest");
var app = require("../mainTest");

describe("API", function() {
  var req, res;

  describe("/v3/user/signout POST", function() {
    it("signout works", function(done) {
      request(app)
        .post("/api/v3/signout")
        .set("apikey", global.apikey)
        .set("access-token", global.user1.apiaccesstoken)
        .send({})
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          done();
        });
    });
  });
});
