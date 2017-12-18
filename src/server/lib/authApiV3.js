/** Auth checker for HTTP API */

var _ = require("lodash");
var async = require("async");

var Const = require("./consts");
var Config = require("./init");
var DatabaseManager = require("./DatabaseManager");
var Utils = require("./utils");

var apikeyModel = require("../Models/APIKey.js").get();
var organizationModel = require("../Models/Organization.js").get();
var userModel = require("../Models/User").get();

function checkAPIKey(request, response, next) {
  var apikey = request.headers["apikey"];
  var token = request.headers["access-token"];

  if (!apikey) {
    response.status(401).send("Wrong API Key");

    return;
  }

  async.waterfall(
    [
      done => {
        var result = {};

        apikeyModel.findOne(
          {
            key: apikey
          },
          function(err, findResult) {
            if (_.isEmpty(findResult)) {
              response.status(401).send("Wrong API Key");
              return;
            }

            result.apikey = findResult;

            done(err, result);
          }
        );
      },
      (result, done) => {
        organizationModel.findOne(
          {
            _id: result.apikey.organizationId,
            status: 1
          },
          {
            _id: true,
            organizationId: true,
            name: true,
            craeted: true,
            status: true
          },
          (err, findResult) => {
            if (_.isEmpty(findResult)) {
              response.status(401).send("Wrong API Key");
              return;
            }

            result.organization = findResult;

            done(err, result);
          }
        );
      },
      (result, done) => {
        const checkurl = request.originalUrl.replace(/\?.*/, "");
        if (/test/.test(checkurl) || /signin/.test(checkurl)) {
          done("skip", result);
          return;
        }

        // check accesstoken
        userModel.findOne(
          {
            "token.token": token
          },
          function(err, findResult) {
            if (_.isEmpty(findResult)) {
              response.status(403).send("Wrong Access Token");
              return;
            }

            var tokenObj = _.find(findResult.token, function(tokenObjInAry) {
              return tokenObjInAry.token == token;
            });

            var tokenGenerated = 0;

            if (tokenObj) tokenGenerated = tokenObj.generateAt;

            var diff = Utils.now() - tokenGenerated;

            if (diff > Const.tokenValidInteval) {
              response.status(403).send("Wrong Access Token");
              return;
            }

            result.user = findResult;

            done(err, result);
          }
        );
      },
      (result, done) => {
        if (result.user.organizationId != result.organization._id.toString()) {
          response.status(403).send("Wrong Access Token");
          return;
        }

        done(null, result);
      }
    ],
    (err, result) => {
      if (err && err != "skip") {
        response.status(500).send("Server Error");
        return;
      }

      request.organization = result.organization;
      request.user = result.user;

      next();
    }
  );
}

module.exports = checkAPIKey;
