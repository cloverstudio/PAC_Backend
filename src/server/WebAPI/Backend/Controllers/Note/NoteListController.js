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
var RoomModel = require(pathTop + 'Models/Room');
var UserModel = require(pathTop + 'Models/User');

var PermissionLogic = require(pathTop + 'Logics/Permission');

var tokenChecker = require(pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var NoteListController = function () {
}

_.extend(NoteListController.prototype, BackendBase.prototype);

NoteListController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {get} /api/v2/note/list Get Note List
      * @apiName Get Note List
      * @apiGroup WebAPI
      * @apiDescription Get Note List
      * 
      * @apiHeader {String} access-token Users unique access-token.
      * 
      * @apiSuccessExample Success-Response:
        {
            "code": 1,
            "time": 1457363319718,
            "data": {
                "notes": [
                    {
                        "__v": 0,
                        "chatId": "1-56c32acd331dd81f8134f200-56c32acd331dd81f8134f200",
                        "note": "text",
                        "created": 1457363319710,
                        "modified": "1457363319710"
                    }
                ]
            }
        }
    
    **/

    router.get('/', tokenChecker, function (request, response) {

        const noteModel = NoteModel.get();
        const roomModel = RoomModel.get();
        const userModel = UserModel.get();

        const user = request.user;

        async.waterfall([
            getGroupIds,
            getRoomIds,
            getUserIds,
            getNotes
        ], endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function getGroupIds(done) {

            // get departments
            PermissionLogic.getDepartments(user._id.toString(), function (departments) {

                var groupIds = _.union(user.groups, departments);

                groupIds = groupIds.map((id) => {
                    return new RegExp('^.*' + Utils.escapeRegExp(id.toString()) + '.*$', "i")
                });
                done(null, { groupIds: groupIds });

            });

        };

        function getRoomIds(result, done) {

            roomModel.find({
                organizationId: user.organizationId,
                users: user._id.toString()
            }, function (err, findResult) {

                result.roomIds = findResult.map((obj) => {
                    return new RegExp('^.*' + Utils.escapeRegExp(obj._id.toString()) + '.*$', "i")
                });
                done(err, result);

            });

        };

        function getUserIds(result, done) {

            userModel.find({
                organizationId: user.organizationId,
                status: Const.userStatus.enabled,
                groups: { $in: result.groupIds },
                _id: { $ne: user._id }
            }, function (err, findResult) {

                result.userIds = findResult.map((obj) => {
                    return new RegExp('^.*' + Utils.escapeRegExp(obj._id.toString()) + '.*$', "i")
                });
                done(err, result);

            });

        };

        function getNotes(result, done) {

            var ids = _.union(result.groupIds, result.roomIds, result.userIds);

            noteModel.find({
                chatId: { $in: ids }
            }, function (err, findResult) {

                result.notes = findResult;
                done(err, result);

            });

        };

        function endAsync(err, result) {

            if (err) {
                console.log("critical err", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            }

            self.successResponse(response, Const.responsecodeSucceed, {
                notes: result.notes
            });

        };

    });

    return router;

}

module["exports"] = new NoteListController();
