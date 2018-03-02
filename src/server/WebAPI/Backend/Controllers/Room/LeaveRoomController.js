/** Called for /api/v2/room/leave Leave API */

var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var _ = require('lodash');
var async = require('async');
var validator = require('validator');
var fs = require('fs-extra');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var Config = require(pathTop + "lib/init");
var DatabaseManager = require(pathTop + 'lib/DatabaseManager');
var Utils = require(pathTop + 'lib/utils');
var UserModel = require(pathTop + 'Models/User');
var RoomModel = require(pathTop + 'Models/Room');
var FavoriteModel = require(pathTop + 'Models/Favorite');

var HistoryModel = require(pathTop + 'Models/History');
var tokenChecker = require(pathTop + 'lib/authApi');

var SocketAPIHandler = require(pathTop + 'SocketAPI/SocketAPIHandler');

var BackendBase = require('../BackendBase');

var LeaveRoomController = function () { }


_.extend(LeaveRoomController.prototype, BackendBase.prototype);

LeaveRoomController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {post} /api/v2/room/leave Leave from room
      * @apiName Leave from room
      * @apiGroup WebAPI
      * @apiHeader {String} access-Token Users unique access-token.
      * @apiDescription Leave from joined room.
      * @apiParam {string} roomId roomId
      * @apiSuccessExample Success-Response:
     
 {
     success: 1,
     data: {
     }
 }
 
     */

    router.post('/', tokenChecker, function (request, response) {

        var roomId = request.body.roomId;
        var loginUserId = request.user.get("id");

        var roomModel = RoomModel.get();
        var favoriteModel = FavoriteModel.get();

        roomModel.findOne({ _id: roomId }, function (err, room) {

            if (err) {

                self.successResponse(response, Const.responsecodeLeaveRoomWrongRoomId);

                return;
            }

            if (!room) {

                self.successResponse(response, Const.responsecodeLeaveRoomWrongRoomId);

                return;

            }

            var newUsersList = [];

            _.forEach(room.users, function (userid) {

                if (userid != loginUserId)
                    newUsersList.push(userid);

            });

            if (loginUserId == room.owner.toString()) {

                // delete from other user's history

                // delete room
                roomModel.remove({
                    _id: room.id
                }, function (err, removeResult) {

                    if (err) {
                        console.log(err);
                        self.errorResponse(response, Const.httpCodeServerError);
                        return;
                    }

                    self.successResponse(response, Const.responsecodeSucceed);

                });

                // delete from history
                var historyModel = HistoryModel.get();
                historyModel.remove({ chatId: room._id.toString() }, function (err, deleteResult) {

                    // send socket
                    _.forEach(room.users, function (userId) {

                        if (userId) {
                            SocketAPIHandler.emitToUser(
                                userId,
                                'delete_room',
                                { conversation: room.toObject() }
                            );
                        }

                    });

                });

                favoriteModel.remove({
                    roomId: Const.chatTypeRoom + "-" + room._id.toString()
                }, function (err, deleteResult) {

                });


            } else {

                room.update({
                    modified: Utils.now(),
                    users: newUsersList
                }, {}, function (err, updateResult) {

                    if (err) {
                        console.log(err);
                        self.errorResponse(response, Const.httpCodeServerError);
                        return;
                    }

                    self.successResponse(response, Const.responsecodeSucceed);

                });

                // delete from history
                var historyModel = HistoryModel.get();
                historyModel.remove({
                    chatId: room._id.toString(),
                    userId: loginUserId
                }, function (err, deleteResult) {


                });

                favoriteModel.remove({
                    roomId: Const.chatTypeRoom + "-" + room._id.toString(),
                    userId: loginUserId
                }, function (err, deleteResult) {

                });


            }

            // stop sending notification
            SocketAPIHandler.leaveFrom(loginUserId, Const.chatTypeRoom, roomId);

        });

    });

    return router;
}

module["exports"] = new LeaveRoomController();
