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
var SocketAPIHandler = require(pathTop + "SocketAPI/SocketAPIHandler");

var MessageModel = require(pathTop + 'Models/Message');

var tokenChecker = require(pathTop + 'lib/authApi');
var BackendBase = require('../BackendBase');

var UpdateHistory = require(pathTop + 'Logics/UpdateHistory');

var DeliverMessageController = function () {
}

_.extend(DeliverMessageController.prototype, BackendBase.prototype);

DeliverMessageController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {post} /api/v2/message/deliver Update Message Delivered To 
      * @apiName Update Message Delivered To 
      * @apiGroup WebAPI
      * @apiDescription 

      * @apiHeader {String} access-token Users unique access-token.

      * @apiParam {String} messageId messageId

      * @apiSuccessExample Success-Response:
        {
            "code": 1,
            "time": 1457363319718,
            "data": {}
        }
    **/

    router.post('/', tokenChecker, function (request, response) {

        var messageId = request.body.messageId;

        var user = request.user;

        if (!messageId)
            return self.successResponse(response, Const.responsecodeDeliverMessageNoMessageId);

        var messageModel = MessageModel.get();

        async.waterfall([

            (done) => {

                var result = {};

                messageModel.findOne({
                    _id: messageId
                }, (err, findResult) => {

                    if (!findResult)
                        return self.successResponse(response, Const.responsecodeDeliverMessageWrongMessageId);

                    // do nothing for message sent user
                    if (findResult.userID == user._id.toString())
                        return self.successResponse(response, Const.responsecodeDeliverMessageUserIsSender);

                    result.isDelivered = !_.isEmpty(_.filter(findResult.deliveredTo, { userId: user._id.toString() }));
                    result.message = findResult;
                    done(err, result);

                });

            },
            (result, done) => {

                if (result.isDelivered)
                    return done(null, result);

                var deliveredToRow = {
                    userId: user._id.toString(),
                    at: Utils.now(),
                };

                messageModel.update(
                    { _id: messageId },
                    {
                        $push: {
                            deliveredTo: deliveredToRow
                        }
                    },
                    (err, updateResult) => {

                        result.message.deliveredTo.push(deliveredToRow);
                        done(err, result);

                    });

            },
            (result, done) => {

                UpdateHistory.updateLastMessageStatus({
                    messageId: messageId,
                    delivered: true
                }, (err) => {

                    done(err, result);

                });

            },
            (result, done) => {

                MessageModel.populateMessages([result.message], function (err, data) {

                    done(err, data[0]);

                });

            },
            (message, done) => {

                done(null, message);

            }
        ], (err, message) => {

            if (err) {
                console.log("critical err", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            }

            var chatType = message.roomID.split("-")[0];

            // websocket notification
            if (chatType == Const.chatTypeGroup) {

                SocketAPIHandler.emitToRoom(message.roomID, 'updatemessages', [message]);

            } else if (chatType == Const.chatTypeRoom) {

                SocketAPIHandler.emitToRoom(message.roomID, 'updatemessages', [message]);

            } else if (chatType == Const.chatTypePrivate) {

                var splitAry = message.roomID.split("-");

                if (splitAry.length < 2)
                    return;

                var user1 = splitAry[1];
                var user2 = splitAry[2];

                var toUser = null;
                var fromUser = null;

                if (user1 == user._id.toString()) {
                    toUser = user2;
                    fromUser = user1;
                } else {
                    toUser = user1;
                    fromUser = user2;
                }

                // send to myself
                DatabaseManager.redisGet(Const.redisKeyUserId + fromUser, function (err, redisResult) {

                    var socketIds = _.pluck(redisResult, "socketId");

                    if (!_.isArray(redisResult))
                        return;

                    _.forEach(redisResult, function (socketIdObj) {
                        SocketAPIHandler.emitToSocket(socketIdObj.socketId, 'updatemessages', [message]);
                    })

                });

                // send to user who got message
                DatabaseManager.redisGet(Const.redisKeyUserId + toUser, function (err, redisResult) {

                    var socketIds = _.pluck(redisResult, "socketId");

                    if (!_.isArray(redisResult))
                        return;

                    _.forEach(redisResult, function (socketIdObj) {
                        SocketAPIHandler.emitToSocket(socketIdObj.socketId, 'updatemessages', [message]);
                    })

                });

            }

            self.successResponse(response, Const.responsecodeSucceed);

        });

    });

    return router;

}

module["exports"] = new DeliverMessageController();
