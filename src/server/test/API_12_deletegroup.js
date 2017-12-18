var should = require("should");
var request = require("supertest");
var app = require("../mainTest");
const Const = require("../lib/consts");

describe("API", function() {
  var req, res;

  describe("/v3/groups/{groupId} DELETE", function() {
    it("returns 401, wrong apiKey", done => {
      request(app)
        .delete("/api/v3/groups/" + global.createdGroup.id)
        .set("apikey", global.apikey + "wrong")
        .set("access-token", global.user1.apiaccesstoken)
        .expect(401, done);
    });

    it("returns 403, Wrong access token", done => {
      request(app)
        .delete("/api/v3/groups/" + global.createdGroup.id)
        .set("apikey", global.apikey)
        .set("access-token", global.user1.apiaccesstoken + "wrong")
        .expect(403, done);
    });

    it("returns 403, User2 doesn't have permission", done => {
      request(app)
        .delete("/api/v3/groups/" + global.createdGroup.id)
        .set("apikey", global.apikey)
        .set("access-token", global.user2.apiaccesstoken)
        .expect(403, done);
    });

    it("returns 422, if group id is wrong", done => {
      request(app)
        .delete("/api/v3/groups/" + "wrongId")
        .set("apikey", global.apikey)
        .set("access-token", global.user1.apiaccesstoken)
        .expect(422, done);
    });

    it("returns 422, groups is not existed", done => {
      request(app)
        .delete("/api/v3/groups/" + "59a2db892061174208544201")
        .set("apikey", global.apikey)
        .set("access-token", global.user1.apiaccesstoken)
        .expect(422, done);
    });

    it("delete group", done => {
      request(app)
        .delete("/api/v3/groups/" + global.createdGroup.id)
        .set("apikey", global.apikey)
        .set("access-token", global.user1.apiaccesstoken)
        .expect(200)
        .end((err, res) => {
          if (err) throw err;

          console.log("asdf asdf asdf asdfa sdf asdf", res.body);

          done();
        });
    });
  });
});
