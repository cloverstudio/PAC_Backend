/** Called for /api/v2/message/favorite/add API */

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

var tokenChecker = require(pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var UndeliverMessageListController = function () {
}

_.extend(UndeliverMessageListController.prototype, BackendBase.prototype);

UndeliverMessageListController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {get} /api/v2/message/undeliver/list/:chatId? Get Undelivered Messages
      * @apiName Get Undelivered Messages
      * @apiGroup WebAPI
      * @apiDescription Get Undelivered Messages
      * 
      * @apiHeader {String} access-token Users unique access-token.
      * 
      * @apiSuccessExample Success-Response:
        {
            "code": 1,
            "time": 1457363319718,
            "data": {
                "messages": [
                    {
                        "seenBy": [
                            {
                                "user": "5a1eafc80ab9887733f0d1b6",
                                "at": 1516701042514,
                                "version": 2
                            },
                            {
                                "user": "59ee01d2064dd9956bc2a639",
                                "at": 1517567665236,
                                "version": 2
                            }
                        ],
                        "deliveredTo": [],
                        "_id": "5a54ba3e3594b1432d5ec8ce",
                        "userID": "59e899e085b675354ba8f15d",
                        "roomID": "2-5a183962156f083a372baebb",
                        "message": "ej",
                        "localID": "_bfhpANTSf7ijPJN51NKdPGwXnkkDyTrB",
                        "type": 1,
                        "attributes": {
                            "useclient": "web"
                        },
                        "created": 1515502142615,
                        "user": "59e899e085b675354ba8f15d",
                        "__v": 0
                    }
                ]
            }
        }
    
    **/

    router.get('/:chatId?', tokenChecker, function (request, response) {

        const chatId = request.params.chatId;

        const messageModel = MessageModel.get();
        const user = request.user;

        async.waterfall([
            getMessages
        ], endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function getMessages(done) {

            var result = {};

            var query = {
                deliveredTo: { $exists: false }
            }

            if (chatId)
                query.roomID = chatId;

            messageModel.find(query, (err, findResult) => {

                result.messages = findResult;
                done(err, result);

            }).sort({ created: "desc" }).limit(100);

        };

        function endAsync(err, result) {

            if (err) {
                console.log("critical err", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            }

            self.successResponse(response, Const.responsecodeSucceed, {
                messages: result.messages
            });

        };

    });

    return router;

}

module["exports"] = new UndeliverMessageListController();
