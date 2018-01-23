/**  Called for /api/v2/test API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');


var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var Config = require(pathTop + "lib/init");
var DatabaseManager = require(pathTop + 'lib/DatabaseManager');
var Utils = require(pathTop + 'lib/utils');

var MessageModel = require(pathTop + 'Models/Message');
var UserModel = require(pathTop + 'Models/User');

var BackendBase = require('../BackendBase');

var SeenByController = function () {
}

_.extend(SeenByController.prototype, BackendBase.prototype);

SeenByController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {get} /api/v2/message/seenby/messageid Get list of users who've seen the message
      * @apiName Get SeenBy
      * @apiGroup WebAPI
      * @apiDescription Returns array of user model
      **/

    router.get('/:messageid', function (request, response) {

        var messageId = request.params.messageid;
        var messageModel = MessageModel.get();
        var userModel = UserModel.get();

        if (!Utils.isObjectId(messageId)) {
            self.successResponse(response, Const.responsecodeForwardMessageInvalidChatId);
            return;
        }

        async.waterfall([

            (done) => {

                var result = {};

                messageModel.findOne({ _id: messageId }, (err, findResult) => {

                    if (!findResult) {
                        self.successResponse(response, Const.responsecodeForwardMessageInvalidChatId);
                        return;
                    }

                    result.message = findResult;
                    result.seenBy = findResult.seenBy;
                    result.deliveredTo = findResult.deliveredTo.map((item) => { return item.toObject() });
                    done(err, result);

                });

            },
            (result, done) => {

                var seenByUserIds = _.map(result.message.seenBy, "user");
                var deliveredToUserIds = _.map(result.message.deliveredTo, "userId");

                var userIds = _.union(seenByUserIds, deliveredToUserIds);

                userIds = _.filter(userIds, (str) => { return Utils.isObjectId(str) });

                userModel.find({ _id: { $in: userIds } },
                    UserModel.defaultResponseFields,
                    (err, findResult) => {
                        result.users = findResult;
                        done(err, result);
                    });

            }

        ], (err, result) => {

            if (err) {
                console.log("critical err", err);
                self.errorResponse(response, Const.httpCodeServerError);
                return;
            }

            var seenByAry = _.map(result.seenBy, function (obj) {

                var user = _.find(result.users, (userRow) => {
                    return userRow._id.toString() == obj.user;
                });

                obj.user = user;

                return obj;

            });

            var deliveredToAry = _.map(result.deliveredTo, function (obj) {

                var user = _.find(result.users, (userRow) => {
                    return userRow._id.toString() == obj.userId;
                });

                obj.user = user;

                return obj;

            });

            self.successResponse(response, Const.responsecodeSucceed, {
                seenBy: seenByAry,
                deliveredTo: deliveredToAry
            });

        });

    });

    return router;

}

module["exports"] = new SeenByController();
