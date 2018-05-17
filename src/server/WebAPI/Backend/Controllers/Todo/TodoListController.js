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
      * @apiDescription Edit Todo
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

    return router;

}

module["exports"] = new TodoListController();