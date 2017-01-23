/**  Hook Model */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');
var Utils = require("../lib/utils");

var BaseModel = require('./BaseModel');

var BaseModel = require('./BaseModel');

var HookModel = function(){};

_.extend(HookModel.prototype,BaseModel.prototype);

HookModel.prototype.init = function(mongoose){
    
    this.schema = new mongoose.Schema({
        userId: { type: String, index: true },
        identifier: { type: String, index: true },
        targetType: Number,
        targetId: { type: String, index: true },
        hookType: Number,
        url : String,
        created: Number
    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "hook", this.schema);

}

HookModel.get = function(){
    
    return DatabaseManager.getModel('Hook').model;
    
}

module["exports"] = HookModel;
