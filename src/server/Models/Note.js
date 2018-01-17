/**  Favorite Model */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');
var Utils = require("../lib/utils");

var BaseModel = require('./BaseModel');

var Note = function () { };

_.extend(Note.prototype, BaseModel.prototype);

Note.prototype.init = function (mongoose) {

    this.schema = new mongoose.Schema({
        chatId: { type: String, index: true },
        note: { type: String, index: true },
        created: Number,
        modified: Number

    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "note", this.schema);

}

Note.get = function () {

    return DatabaseManager.getModel('Note').model;

}

module["exports"] = Note;
