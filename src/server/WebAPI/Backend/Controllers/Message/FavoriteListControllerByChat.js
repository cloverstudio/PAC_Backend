/** Called for /api/v2/message/favorite/list/:chatId/:page API */


var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var Config = require(pathTop + "lib/init");
var DatabaseManager = require(pathTop + 'lib/DatabaseManager');

var MessageModel = require(pathTop + 'Models/Message');

var Utils = require(pathTop + 'lib/utils');
var FavoriteModel = require(pathTop + 'Models/Favorite');
var OrganizationModel = require(pathTop + 'Models/Organization');
var PolulateMessageLogic = require(pathTop + 'Logics/PolulateMessage');
var tokenChecker = require(pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var UserDetailController = function () {
}

_.extend(UserDetailController.prototype, BackendBase.prototype);

UserDetailController.prototype.init = function (app) {

    var self = this;

    router.get('/:chatId/:page', tokenChecker, function (request, response) {

        var page = request.params.page - 1;
        var chatId = request.params.chatId;

        var favoriteModel = FavoriteModel.get();
        var messageModel = MessageModel.get();

        async.waterfall([function (done) {

            var result = {};

            var query = favoriteModel.find({
                userId: request.user._id,
                roomId: chatId
            })
                .sort({ 'created': 'desc' })
                .skip(Const.pagingRows * page)
                .limit(Const.pagingRows);

            query.exec(function (err, data) {

                data = data.map(function (item) {
                    return item.toObject();
                });

                result.list = data;
                result.count = data.length;

                done(err, result);

            });

        },
        function (result, done) {

            // get message models
            var messagesIds = _.pluck(result.list, "messageId");

            messageModel.find({
                _id: { $in: messagesIds }
            }, function (err, findResult) {

                findResult = findResult.map(function (item) {
                    return item.toObject();
                });

                result.messages = findResult;

                done(err, result);

            });

        }, function (result, done) {

            PolulateMessageLogic.populateEverything(result.messages, request.user, function (newData) {

                if (!newData) {
                    done("failed to populate message", result);
                    return;
                }

                result.messages = newData;
                done(null, result);

            });

        }, function (result, done) {

            // map to favorite
            result.list = _.map(result.list, function (favorite) {

                var message = _.find(result.messages, function (message) {

                    return message._id.toString() == favorite.messageId;

                });

                favorite.messageModel = message;

                return favorite;

            });

            done(null, result);

        }
        ],
            function (err, result) {

                if (err) {
                    console.log("critical err", err);
                    self.errorResponse(response, Const.httpCodeServerError);
                    return;
                }

                self.successResponse(response, Const.responsecodeSucceed, {
                    favorites: result.list,
                    count: result.count
                });

            });

    });

    return router;

}

module["exports"] = new UserDetailController();
