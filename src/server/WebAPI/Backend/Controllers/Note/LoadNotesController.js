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
var NoteModel = require(pathTop + 'Models/Note');
var tokenChecker = require(pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var LoadNotesController = function () {
}

_.extend(LoadNotesController.prototype, BackendBase.prototype);

LoadNotesController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {get} /api/v2/note/list/:chatId load notes for the chat
      * @apiName AddToFavorite
      * @apiGroup WebAPI
      * @apiDescription Add to callers favorite
      * @apiHeader {String} access-token Users unique access-token.
      * @apiParam {string} chatId chatId
      * @apiSuccessExample Success-Response:
 {
     "code": 1,
     "time": 1457363319718,
     "data": {
         "note": {
             "__v": 0,
             "chatId": "1-56c32acd331dd81f8134f200-56c32acd331dd81f8134f200",
             "note": "text",
             "created": 1457363319710,
             "modified": "1457363319710"
         }
     }
 }
 
 **/

    router.get('/:chatId', tokenChecker, function (request, response) {

        const noteModel = NoteModel.get();
        const chatId = request.params.chatId;

        async.waterfall([function (done) {

            var result = {};

            // check existance
            noteModel.findOne({
                chatId: chatId
            }, function (err, findResult) {

                result.note = findResult;
                done(err, result)

            });

        }

        ],
            function (err, result) {

                if (err) {
                    console.log("critical err", err);
                    self.errorResponse(response, Const.httpCodeServerError);
                    return;
                }

                self.successResponse(response, Const.responsecodeSucceed, {
                    note: result.note
                });

            });

    });

    return router;

}

module["exports"] = new LoadNotesController();
