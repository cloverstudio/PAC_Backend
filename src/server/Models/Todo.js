/**  Favorite Model */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');
var Utils = require("../lib/utils");

var BaseModel = require('./BaseModel');

var Todo = function () { };

_.extend(Todo.prototype, BaseModel.prototype);

Todo.prototype.init = function (mongoose) {

    this.schema = new mongoose.Schema({
        userId: { type: String, index: true },
        chatId: { type: String, index: true },
        text: { type: String, index: true },
        created: Number,
        modified: Number,
        dueDate: Number,
        assignedUserId: { type: String, index: true },
        position: Number,
        completed: Boolean
    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "todo", this.schema);

}

Todo.get = function () {

    return DatabaseManager.getModel('Todo').model;

}

module["exports"] = Todo;
