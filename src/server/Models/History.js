/**  Historuy Model */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');
var Utils = require("../lib/utils");

var BaseModel = require('./BaseModel');

var History = function(){};

_.extend(History.prototype,BaseModel.prototype);

History.prototype.init = function(mongoose){

    this.schema = new mongoose.Schema({
        userId: { type: String, index: true },
        chatId: { type: String, index: true },
        chatType: Number,
        lastUpdate: Number,
        lastUpdateUnreadCount: Number,
        lastUpdateUser: {},
        lastMessage: {},
        unreadCount : Number,
    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "history", this.schema);

}

History.get = function(){

    return DatabaseManager.getModel('History').model;

}

History.update = function(chatObj,type){
    
    
        
}

module["exports"] = History;
