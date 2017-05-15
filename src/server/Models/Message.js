/**  Message Model */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');
var Utils = require("../lib/utils");

var BaseModel = require('./BaseModel');

var Message = function(){};

_.extend(Message.prototype,BaseModel.prototype);

Message.prototype.init = function(mongoose){

    // Defining a schema
    this.schema = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, index: true },
        localID: { type: String, index: true },
        userID: { type: String, index: true },
        roomID: { type: String, index: true },
        type: Number,
        message: String,
        image: String,
        remoteIpAddress: String,
        file: {
            file: {
                id: mongoose.Schema.Types.ObjectId,
	            name: String,
	            size: Number,
	            mimeType: String
            },
            thumb: {
                id: mongoose.Schema.Types.ObjectId,
	            name: String,
	            size: Number,
	            mimeType: String
            }
        },
        seenBy:[],
        location: {
	            lat: Number,
	            lng: Number
        },
        deleted: Number,
        created: Number,
        attributes: {}
    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "messages", this.schema);

}

Message.get = function(){

    return DatabaseManager.getModel('Message').model;

}

module["exports"] = Favorite;
