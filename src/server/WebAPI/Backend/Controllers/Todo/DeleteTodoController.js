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

var DeleteTodoController = function () {
}

_.extend(DeleteTodoController.prototype, BackendBase.prototype);

DeleteTodoController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {get} /api/v2/todo/delete/:id Delete Todo
      * @apiName Delete Todo
      * @apiGroup WebAPI
      * @apiDescription Delete Todo
      * 
      * @apiHeader {String} access-token Users unique access-token.
      * 
      * @apiSuccessExample Success-Response:
        {
            "code": 1,
            "time": 1526562116680,
            "data": {}
        }
    
    **/

    router.get('/:id', tokenChecker, function (request, response) {

        var id = request.params.id;

        var user = request.user;

        var todoModel = TodoModel.get();

        async.waterfall([
            checkIfExist,
            getTodosByChatId,
            updateTodos,
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

        function getTodosByChatId(result, done) {

            todoModel.find({
                chatId: result.todo.chatId
            }, (err, findResult) => {

                result.todos = findResult;
                done(err, result);

            }).sort({ position: "asc" });

        };

        function updateTodos(result, done) {

            var todos = result.todos;
            var position = 1;

            async.eachSeries(todos, (todoObj, doneEach) => {

                if (todoObj._id.toString() == id) {

                    todoObj.remove((err, deleteResult) => {
                        doneEach(err);
                    });
                    return;

                }

                todoObj.position = position;
                position++;

                todoObj.save((err, saveResult) => {
                    doneEach(err);
                });

            }, (err) => {
                done(err, result);
            });

        };

        function endAsync(err, result) {

            if (err) {
                console.log("critical err", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            }

            self.successResponse(response, Const.responsecodeSucceed);

        };

    });

    return router;

}

module["exports"] = new DeleteTodoController();