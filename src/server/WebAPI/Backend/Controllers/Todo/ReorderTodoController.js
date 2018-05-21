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

var ReorderTodoController = function () {
}

_.extend(ReorderTodoController.prototype, BackendBase.prototype);

ReorderTodoController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {post} /api/v2/todo/reorder Reorder Todo
      * @apiName Reorder Todo
      * @apiGroup WebAPI
      * @apiDescription Reorder Todo
      * 
      * @apiHeader {String} access-token Users unique access-token.
      * 
      * @apiParam {Object[]} todoList todo object list with id and position
      * 
      * @apiSuccessExample Success-Response:
        {
            "code": 1,
            "time": 1526562116680,
            "data": {}
        }
    
    **/

    router.post('/', tokenChecker, function (request, response) {

        var todoList = request.body.todoList;

        var user = request.user;

        var todoModel = TodoModel.get();

        async.waterfall([
            validate,
            updateTodos,
        ], endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function validate(done) {

            var result = {};

            if (!_.isArray(todoList))
                return self.successResponse(response, Const.responsecodeTodoListNotArray);

            var isValid = todoList.every((todoObj) => {

                if (_.isUndefined(todoObj.id) || _.isUndefined(todoObj.position))
                    return;

                return true;

            });

            if (!isValid)
                return self.successResponse(response, Const.responsecodeTodoReorderWrongObjectProperties);

            done(null, result);

        };

        function updateTodos(result, done) {

            async.eachSeries(todoList, (todoObj, doneEach) => {

                todoModel.update(
                    {
                        _id: todoObj.id
                    },
                    {
                        position: todoObj.position
                    },
                    (err, updateResult) => {
                        doneEach(err);
                    }
                );

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

module["exports"] = new ReorderTodoController();