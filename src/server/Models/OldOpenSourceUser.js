/**  User Model */

var _ = require('lodash');
var mongoose = require('mongoose');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');
var Utils = require("../lib/utils");

var BaseModel = require('./BaseModel');
var OldUser = function(){};

_.extend(OldUser.prototype,BaseModel.prototype);

OldUser.prototype.init = function(mongoose){
    
     // Defining a schema
    var userSchema = new mongoose.Schema({
        userID: { type: String, index: true },
        name: String,
        avatarURL: String,
        token: String,
        tokenGeneratedAt: Number,
        created: Number
    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "spika_users", this.schema);

}

OldUser.get = function(){
    
    return DatabaseManager.getModel('OldOpenSourceUser').model;
    
}

module["exports"] = OldUser;
