/**  Called for /api/v3/signout API */

var _ = require("lodash");
var async = require("async");

var express = require("express");
var router = express.Router();
var sha1 = require("sha1");

var pathTop = "../../../";

var Const = require(pathTop + "lib/consts");
var Config = require(pathTop + "lib/init");
var Utils = require(pathTop + "lib/utils");
var DatabaseManager = require(pathTop + "lib/DatabaseManager");
var checkAPIKey = require(pathTop + "lib/authApiV3");

var APIBase = require("./APIBase");

var UserModel = require(pathTop + "Models/User");
var OrganizationModel = require(pathTop + "Models/Organization");

var SignoutController = function() {};

_.extend(SignoutController.prototype, APIBase.prototype);

SignoutController.prototype.init = function(app) {
  var self = this;

  /**
   * @api {post} /api/v3/signout
   * @apiName Signout
   **/

  router.post("", checkAPIKey, (request, response) => {
    const userModel = UserModel.get();

    async.waterfall(
      [
        done => {
          const result = {};

          userModel.update(
            {
              _id: request.user._id
            },
            {
              token: [],
              pushToken: [],
              voipPushToken: []
            },
            {},
            () => {
              done(null, result);
            }
          );
        },
        (result, done) => {
          // make user offline
          DatabaseManager.redisDel(
            Const.redisKeyOnlineStatus + request.user._id
          );

          done(null, result);
        }
      ],
      (err, result) => {
        if (err) {
          if (err.status && err.message)
            response.status(err.status).send(err.message);
          else response.status(500).send("Server Error");

          return;
        }

        self.successResponse(response, Const.responsecodeSucceed, {});
      }
    );
  });

  return router;
};

module["exports"] = new SignoutController();
