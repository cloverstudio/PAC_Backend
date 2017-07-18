/**  Hook Model */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');
var Utils = require("../lib/utils");

var BaseModel = require('./BaseModel');


var APIKeyModel = function(){};

_.extend(APIKeyModel.prototype,BaseModel.prototype);

APIKeyModel.prototype.init = function(mongoose){
    
    this.schema = new mongoose.Schema({
        organizationId: { type: String, index: true },
        key: { type: String, index: true },
        state: Number,
        created: Number
    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "apikey", this.schema);

}

APIKeyModel.get = function(){
    
    return DatabaseManager.getModel('APIKey').model;
    
}

module["exports"] = APIKeyModel;
