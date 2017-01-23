/**  Favorite Model */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');
var Utils = require("../lib/utils");

var BaseModel = require('./BaseModel');

var Favorite = function(){};

_.extend(Favorite.prototype,BaseModel.prototype);

Favorite.prototype.init = function(mongoose){

    this.schema = new mongoose.Schema({
        userId: { type: String, index: true },
        messageId: { type: String, index: true },
        roomId: { type: String, index: true },
        created: Number
    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "favorite", this.schema);

}

Favorite.get = function(){

    return DatabaseManager.getModel('Favorite').model;

}

module["exports"] = Favorite;
