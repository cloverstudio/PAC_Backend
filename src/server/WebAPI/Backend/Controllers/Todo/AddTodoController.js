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

var AddTodoController = function () {
}

_.extend(AddTodoController.prototype, BackendBase.prototype);

AddTodoController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {post} /api/v2/todo/add Add Todo
      * @apiName Add Todo
      * @apiGroup WebAPI
      * @apiDescription Add Todo
      * 
      * @apiHeader {String} access-token Users unique access-token.
      * 
      * @apiParam {String} chatId roomId
      * @apiParam {String} text Description
      * 
      * @apiSuccessExample Success-Response:
        {
            "code": 1,
            "time": 1526562116680,
            "data": {
                "todo": {
                    "_id": "5afd7d4468eced673c3cb989",
                    "userId": "59e899e085b675354ba8f15d",
                    "chatId": "1-59e899e085b675354ba8f15d-59ee01d2064dd9956bc2a639",
                    "text": "treći task",
                    "created": 1526562116677,
                    "assignedUserId": "59e899e085b675354ba8f15d",
                    "position": 3,
                    "__v": 0
                }
            }
        }
            
    **/

    router.post('/', tokenChecker, function (request, response) {

        var chatId = request.body.chatId;
        var text = request.body.text;

        var user = request.user;

        if (!chatId)
            return self.successResponse(response, Const.responsecodeTodoNoChatId);

        if (!text)
            return self.successResponse(response, Const.responsecodeTodoNoText);

        var todoModel = TodoModel.get();

        async.waterfall([
            getNextPosition,
            addTodo
        ], endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function getNextPosition(done) {

            todoModel.count({
                chatId: chatId
            }, (err, countResult) => {

                done(err, { nextPosition: countResult + 1 });

            })

        };

        function addTodo(result, done) {

            var model = new todoModel({
                userId: user._id.toString(),
                chatId: chatId,
                text: text,
                created: Utils.now(),
                assignedUserId: user._id.toString(),
                position: result.nextPosition
            });

            model.save((err, saveResult) => {

                result.todo = saveResult;
                done(err, result);

            });

        };

        function endAsync(err, result) {

            if (err) {
                console.log("critical err", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            }

            self.successResponse(response, Const.responsecodeSucceed, {
                todo: result.todo
            });

        };

    });

    return router;

}

module["exports"] = new AddTodoController();