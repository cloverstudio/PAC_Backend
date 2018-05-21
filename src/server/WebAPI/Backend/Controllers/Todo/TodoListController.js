'use strict';

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var Config = require(pathTop + "lib/init");

var Utils = require(pathTop + 'lib/utils');
var TodoModel = require(pathTop + 'Models/Todo');
var RoomModel = require(pathTop + 'Models/Room');

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

        async.waterfall([
            getTodo
        ], endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function getTodo(done) {

            var result = {};

            todoModel.find({
                chatId: chatId
            }, (err, findResult) => {

                result.todos = findResult;
                done(err, result);

            })

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

        async.waterfall([
            getGroupIds,
            getRoomIds,
            getTodos
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
                users: user._id.toString()
            }, function (err, findResult) {

                result.roomIds = findResult.map((obj) => {
                    return new RegExp('^.*' + Utils.escapeRegExp(obj._id.toString()) + '.*$', "i")
                });
                done(err, result);

            });

        };

        function getTodos(result, done) {

            var ids = _.union(result.groupIds, result.roomIds);

            ids.push(new RegExp('^.*' + Utils.escapeRegExp(user._id.toString()) + '.*$', "i"));

            todoModel.find({
                chatId: { $in: ids }
            }, function (err, findResult) {

                result.todos = findResult;
                done(err, result);

            });

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