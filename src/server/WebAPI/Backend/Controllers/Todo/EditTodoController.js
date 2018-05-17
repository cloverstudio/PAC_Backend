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
var UserModel = require(pathTop + 'Models/User');

var tokenChecker = require(pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var EditTodoController = function () {
}

_.extend(EditTodoController.prototype, BackendBase.prototype);

EditTodoController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {post} /api/v2/todo/edit/:id Edit Todo
      * @apiName Edit Todo
      * @apiGroup WebAPI
      * @apiDescription Edit Todo
      * 
      * @apiHeader {String} access-token Users unique access-token.
      * 
      * @apiParam {Number} dueDate unix time in milliseconds
      * @apiParam {String} assignedUserId user assigned to
      * @apiParam {String} text description
      * @apiParam {Number} completed (0 or 1)
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

    router.post('/:id', tokenChecker, function (request, response) {

        var id = request.params.id;

        var dueDate = request.body.dueDate;
        var assignedUserId = request.body.assignedUserId;
        var text = request.body.text;
        var completed = request.body.completed;

        var user = request.user;

        var todoModel = TodoModel.get();
        var userModel = UserModel.get();

        async.waterfall([
            checkIfExist,
            checkAssignedUser,
            saveTodo,
        ], endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function checkIfExist(done) {

            var result = {};

            todoModel.findOne({
                _id: id
            }, (err, findResult) => {

                if (!findResult)
                    return self.successResponse(response, Const.responsecodeTodoNotFound);

                result.todo = findResult;
                done(err, result);

            })

        };

        function checkAssignedUser(result, done) {

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

        function saveTodo(result, done) {

            var todo = result.todo;

            todo.modified = Utils.now();

            if (dueDate)
                todo.dueDate = dueDate;

            if (assignedUserId)
                todo.assignedUserId = assignedUserId;

            if (text)
                todo.text = text;

            if (completed != undefined)
                todo.completed = completed;

            todo.save((err, saveResult) => {

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

module["exports"] = new EditTodoController();