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

      * @apiParam {String} messageIds messageIds

      * @apiSuccessExample Success-Response:
        {
            "code": 1,
            "time": 1457363319718,
            "data": {}
        }
    **/

    router.post('/', tokenChecker, function (request, response) {

        var messageIds = request.body.messageIds;

        var user = request.user;

        if (!messageIds)
            return self.successResponse(response, Const.responsecodeDeliverMessageNoMessageId);

        messageIds = messageIds.split(",").map((id) => {
            return id.trim();
        });

        var messageModel = MessageModel.get();

        async.waterfall([

            (done) => {

                var result = {};

                messageModel.find({
                    _id: { $in: messageIds }
                }, (err, findResult) => {

                    if (_.isEmpty(findResult))
                        return self.successResponse(response, Const.responsecodeDeliverMessageWrongMessageId);

                    result.messages = findResult;
                    done(err, result);

                });

            },
            (result, done) => {

                var undeliveredMesssages = _.filter(result.messages, (message) => {
                    return _.isEmpty(_.find(message.deliveredTo, { userId: user._id.toString() }));
                });

                if (_.isEmpty(undeliveredMesssages))
                    return done(null, result);

                var deliveredToRow = {
                    userId: user._id.toString(),
                    at: Utils.now(),
                };

                var undeliveredMessageIds = _.map(undeliveredMesssages, "_id");

                messageModel.update(
                    { _id: { $in: undeliveredMessageIds } },
                    {
                        $push: {
                            deliveredTo: deliveredToRow
                        }
                    },
                    { multi: true },
                    (err, updateResult) => {

                        _.map(undeliveredMesssages, (message) => {
                            message.deliveredTo.push(deliveredToRow);
                            return message;
                        });

                        done(err, result);

                    });

            },
            (result, done) => {

                UpdateHistory.updateLastMessageStatus({
                    messageIds: messageIds,
                    delivered: true
                }, (err) => {

                    done(err, result);

                });

            },
            (result, done) => {

                MessageModel.populateMessages(result.messages, function (err, data) {

                    done(err, data);

                });

            },
            (messages, done) => {

                done(null, messages);

            }
        ], (err, messages) => {

            if (err) {
                console.log("critical err", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            }

            var roomIds = _.uniq(_.map(messages, "roomID"));

            roomIds.forEach(roomId => {

                var chatType = roomId.split("-")[0];
                var filterMessages = _.filter(messages, { roomID: roomId });

                // websocket notification
                if (chatType == Const.chatTypeGroup) {

                    SocketAPIHandler.emitToRoom(roomId, 'updatemessages', filterMessages);

                } else if (chatType == Const.chatTypeRoom) {

                    SocketAPIHandler.emitToRoom(roomId, 'updatemessages', filterMessages);

                } else if (chatType == Const.chatTypePrivate) {

                    var splitAry = roomId.split("-");

                    if (splitAry.length < 2)
                        return;

                    var fromUser = splitAry[1];
                    var toUser = splitAry[2];

                    if (fromUser != user._id.toString()) {
                        fromUser = splitAry[2];
                        toUser = splitAry[1];
                    }

                    SocketAPIHandler.emitToRoom(toUser, 'updatemessages', filterMessages);
                    SocketAPIHandler.emitToRoom(fromUser, 'updatemessages', filterMessages);

                }

            });

            self.successResponse(response, Const.responsecodeSucceed);

        });

    });

    return router;

}

module["exports"] = new DeliverMessageController();
