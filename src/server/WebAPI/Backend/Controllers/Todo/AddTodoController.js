'use strict';

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");

var Utils = require(pathTop + 'lib/utils');
var TodoModel = require(pathTop + 'Models/Todo');
var UserModel = require(pathTop + 'Models/User');

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
      * @apiParam {Number} dueDate unix time in milliseconds
      * @apiParam {String} assignedUserId user assigned to
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
        var dueDate = request.body.dueDate;
        var assignedUserId = request.body.assignedUserId;

        var user = request.user;

        if (!chatId)
            return self.successResponse(response, Const.responsecodeTodoNoChatId);

        if (!text)
            return self.successResponse(response, Const.responsecodeTodoNoText);

        var todoModel = TodoModel.get();
        var userModel = UserModel.get();

        async.waterfall([
            checkAssignedUser,
            getNextPosition,
            addTodo
        ], endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function checkAssignedUser(done) {

            var result = {};

            if (!assignedUserId)
                return done(null, result);

            userModel.findOne({
                _id: assignedUserId
            }, (err, findResult) => {

                if (!findResult)
                    return self.successResponse(response, Const.responsecodeTodoWrongAssignedUserId);

                done(err, result);

            })

        };

        function getNextPosition(result, done) {

            todoModel.count({
                chatId: chatId
            }, (err, countResult) => {

                result.nextPosition = countResult + 1;
                done(err, result);

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

            if (dueDate)
                model.dueDate = dueDate;

            if (assignedUserId)
                model.assignedUserId = assignedUserId;

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