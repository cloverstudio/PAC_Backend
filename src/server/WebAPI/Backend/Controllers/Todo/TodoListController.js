'use strict';

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var DatabaseManager = require(pathTop + 'lib/DatabaseManager');

var Utils = require(pathTop + 'lib/utils');

var TodoModel = require(pathTop + 'Models/Todo');
var RoomModel = require(pathTop + 'Models/Room');
var GroupModel = require(pathTop + 'Models/Group');
var UserModel = require(pathTop + 'Models/User');

var PermissionLogic = require(pathTop + 'Logics/Permission');

var tokenChecker = require(pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var TodoListController = function () {
}

_.extend(TodoListController.prototype, BackendBase.prototype);

TodoListController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {get} /api/v2/todo/list/:chatId Todo List By Chat
      * @apiName Todo List By Chat
      * @apiGroup WebAPI
      * @apiDescription Todo List By Chat
      * 
      * @apiHeader {String} access-token Users unique access-token.
      * 
      * @apiSuccessExample Success-Response:
        {
            "code": 1,
            "time": 1526562116680,
            "data": {
                "todos": [
                    {
                        "_id": "5afd7d3368eced673c3cb987",
                        "userId": "59e899e085b675354ba8f15d",
                        "chatId": "1-59e899e085b675354ba8f15d-59ee01d2064dd9956bc2a639",
                        "text": "prvi task",
                        "created": 1526562099810,
                        "assignedUserId": "59e899e085b675354ba8f15d",
                        "position": 1,
                        "__v": 0
                    }
                ]
            }
        }
    
    **/

    router.get('/:chatId', tokenChecker, function (request, response) {

        var chatId = request.params.chatId;

        var user = request.user;

        var todoModel = TodoModel.get();
        var userModel = UserModel.get();

        async.waterfall([
            getTodo,
            getAssignedUsers,
            parse
        ], endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function getTodo(done) {

            var result = {};

            todoModel.find({
                chatId: chatId
            }, (err, findResult) => {

                result.todos = findResult.map(todo => {
                    return todo.toObject();
                });
                done(err, result);

            })

        };

        function getAssignedUsers(result, done) {

            var assignedUserIds = _.uniq(_.map(result.todos, "assignedUserId"));

            userModel.find({
                _id: { $in: assignedUserIds }
            }, (err, findResult) => {

                result.assignedUsers = findResult.map(user => {
                    return user.toObject();
                });
                done(err, result);

            })

        };

        function parse(result, done) {

            var todos = result.todos;
            var assignedUsers = result.assignedUsers;

            _.map(todos, (todo) => {

                todo.user = _.find(assignedUsers, { _id: DatabaseManager.toObjectId(todo.assignedUserId) });;
                return todo;

            });

            done(null, result);

        };

        function endAsync(err, result) {

            if (err) {
                console.log("critical err", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            }

            self.successResponse(response, Const.responsecodeSucceed, {
                todos: result.todos
            });

        };

    });

    /**
      * @api {get} /api/v2/todo/list Todo List
      * @apiName Todo List
      * @apiGroup WebAPI
      * @apiDescription Todo List
      * 
      * @apiHeader {String} access-token Users unique access-token.
      * 
      * @apiSuccessExample Success-Response:
        {
            "code": 1,
            "time": 1526562116680,
            "data": {
                "todos": [
                    {
                        "_id": "5afd7d3368eced673c3cb987",
                        "userId": "59e899e085b675354ba8f15d",
                        "chatId": "1-59e899e085b675354ba8f15d-59ee01d2064dd9956bc2a639",
                        "text": "prvi task",
                        "created": 1526562099810,
                        "assignedUserId": "59e899e085b675354ba8f15d",
                        "position": 1,
                        "__v": 0
                    }
                ]
            }
        }
    
    **/

    router.get('/', tokenChecker, function (request, response) {

        const user = request.user;

        const todoModel = TodoModel.get();
        const roomModel = RoomModel.get();
        const groupModel = GroupModel.get();
        const userModel = UserModel.get();

        async.waterfall([
            getGroupIds,
            getRooms,
            getTodos,
            getGroups,
            getUsers,
            getAssignedUsers,
            parseTodos
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

        function getTodos(result, done) {

            var ids = _.union(result.groupIds, _.map(result.rooms, "_id"), [user._id.toString()]);

            ids = ids.map((id) => {
                return new RegExp('^.*' + Utils.escapeRegExp(id.toString()) + '.*$', "i");
            });

            todoModel.find({
                chatId: { $in: ids }
            }, function (err, findResult) {

                result.todos = findResult.map((todo) => {

                    if (!todo.modified)
                        todo.modified = todo.created;

                    return todo.toObject();

                });

                result.todos = _.sortByOrder(result.todos, "modified", "desc");
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

        function getAssignedUsers(result, done) {

            var assignedUserIds = _.uniq(_.map(result.todos, "assignedUserId"));

            userModel.find({
                _id: { $in: assignedUserIds }
            }, (err, findResult) => {

                result.assignedUsers = findResult.map(user => {
                    return user.toObject();
                });
                done(err, result);

            })

        };

        function parseTodos(result, done) {

            var todos = result.todos;
            var users = result.users;
            var groups = result.groups;
            var rooms = result.rooms;
            var assignedUsers = result.assignedUsers;

            _.map(todos, (todo) => {

                var splittedChatId = todo.chatId.split("-");

                var chatType = Number(splittedChatId[0]);

                switch (chatType) {

                    case Const.chatTypePrivate:

                        var userToId = splittedChatId[1];

                        if (userToId == user._id.toString())
                            userToId = splittedChatId[2];

                        var findUser = _.find(users, { _id: DatabaseManager.toObjectId(userToId) });

                        if (findUser) {
                            todo.chatName = findUser.name;
                            todo.chatAvatar = findUser.avatar;
                        }
                        break;

                    case Const.chatTypeGroup:

                        var groupId = splittedChatId[1];

                        var findGroup = _.find(groups, { _id: DatabaseManager.toObjectId(groupId) });

                        if (findGroup) {
                            todo.chatName = findGroup.name;
                            todo.chatAvatar = findGroup.avatar;
                        }
                        break;

                    case Const.chatTypeRoom:

                        var roomId = splittedChatId[1];

                        var findRoom = _.find(rooms, { _id: DatabaseManager.toObjectId(roomId) });

                        if (findRoom) {
                            todo.chatName = findRoom.name;
                            todo.chatAvatar = findRoom.avatar;
                        }
                        break;

                }

                todo.user = _.find(assignedUsers, { _id: DatabaseManager.toObjectId(todo.assignedUserId) });;
                return todo;

            });

            done(null, result);

        };

        function endAsync(err, result) {

            if (err) {
                console.log("critical err", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            }

            self.successResponse(response, Const.responsecodeSucceed, {
                todos: result.todos
            });

        };

    });

    return router;

}

module["exports"] = new TodoListController();