/** Copy this file when create new controller  */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var HistoryModel = require(pathTop + 'Models/History');

var tokenChecker = require(pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var PinController = function () {
}

_.extend(PinController.prototype, BackendBase.prototype);

PinController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {post} /api/v2/user/pin pin / unpin chat
      * @apiName pin / unpin chat
      * @apiGroup WebAPI
      * @apiDescription pin / unpin chat
      * @apiHeader {String} access-token Users unique access-token.
 
      * @apiParam {Number} pin 1 = pin, 0 = unpin
      * @apiParam {String} chatId chatId
      
      * @apiSuccessExample Success-Response:
 {}
 
 **/

    router.post('/', tokenChecker, function (request, response) {

        var pin = request.body.pin;
        var chatId = request.body.chatId;

        var user = request.user;

        async.waterfall([

            function (done) {

                var result = {};

                // check params
                if (pin == undefined || pin != 0 && pin != 1)
                    return self.successResponse(response, Const.responsecodePinChatWrongPinParam);

                if (!chatId)
                    return self.successResponse(response, Const.responsecodePinChatWrongChatIdParam);

                done(null, result);

            },
            function (result, done) {

                var historyModel = HistoryModel.get();

                historyModel.update(
                    {
                        userId: user._id.toString(),
                        chatId: chatId
                    },
                    {
                        pinned: pin == 1 ? true : false
                    },
                    (err, updateResult) => {

                        done(err, result);

                    }
                );

            }

        ], function (err, result) {

            if (err) {
                console.log("critical err", err);
                self.errorResponse(response, Const.httpCodeServerError);
                return;
            }

            self.successResponse(response, Const.responsecodeSucceed);

        });

    });

    return router;

}

module["exports"] = new PinController();
