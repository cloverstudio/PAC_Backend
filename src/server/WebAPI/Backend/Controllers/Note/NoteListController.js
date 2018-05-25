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
var GroupModel = require(pathTop + 'Models/Group');
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
        const groupModel = GroupModel.get();
        const userModel = UserModel.get();

        const user = request.user;

        async.waterfall([
            getGroupIds,
            getRooms,
            getNotes,
            getGroups,
            getUsers,
            parseNotes
        ], endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function getGroupIds(done) {

            // get departments
            PermissionLogic.getDepartments(user._id.toString(), function (departments) {

                var groupIds = _.union(user.groups, departments);
                done(null, { groupIds: groupIds });

            });

        };

        function getRooms(result, done) {

            roomModel.find({
                users: user._id.toString()
            }, function (err, findResult) {

                result.rooms = findResult;
                done(err, result);

            });

        };

        function getNotes(result, done) {

            var ids = _.union(result.groupIds, _.map(result.rooms, "_id"), [user._id.toString()]);

            ids = ids.map((id) => {
                return new RegExp('^.*' + Utils.escapeRegExp(id.toString()) + '.*$', "i");
            });

            noteModel.find({
                chatId: { $in: ids }
            }, function (err, findResult) {

                result.notes = findResult.map((note) => {
                    return note.toObject();
                });
                done(err, result);

            });

        };

        function getGroups(result, done) {

            groupModel.find({
                _id: { $in: result.groupIds }
            }, function (err, findResult) {

                result.groups = findResult;
                done(err, result);

            });

        };

        function getUsers(result, done) {

            userModel.find({
                organizationId: user.organizationId,
                status: Const.userStatus.enabled,
                groups: { $in: result.groupIds },
                _id: { $ne: user._id }
            }, function (err, findResult) {

                result.users = findResult;
                done(err, result);

            });

        };

        function parseNotes(result, done) {

            var notes = result.notes;
            var users = result.users;
            var groups = result.groups;
            var rooms = result.rooms;

            _.map(notes, (note) => {

                var splittedChatId = note.chatId.split("-");

                var chatType = Number(splittedChatId[0]);

                switch (chatType) {

                    case Const.chatTypePrivate:

                        var userToId = splittedChatId[1];

                        if (userToId == user._id.toString())
                            userToId = splittedChatId[2];

                        var findUser = _.find(users, { _id: DatabaseManager.toObjectId(userToId) });

                        if (findUser) {
                            note.chatName = findUser.name;
                            note.chatAvatar = findUser.avatar;
                        }
                        break;

                    case Const.chatTypeGroup:

                        var groupId = splittedChatId[1];

                        var findGroup = _.find(groups, { _id: DatabaseManager.toObjectId(groupId) });

                        if (findGroup) {
                            note.chatName = findGroup.name;
                            note.chatAvatar = findGroup.avatar;
                        }
                        break;

                    case Const.chatTypeRoom:

                        var roomId = splittedChatId[1];

                        var findRoom = _.find(rooms, { _id: DatabaseManager.toObjectId(roomId) });

                        if (findRoom) {
                            note.chatName = findRoom.name;
                            note.chatAvatar = findRoom.avatar;
                        }
                        break;

                }

                return note;

            });

            done(null, result);

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
