/**  Hook Model */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');
var Utils = require("../lib/utils");

var BaseModel = require('./BaseModel');


var WebhookModel = function(){};

_.extend(WebhookModel.prototype,BaseModel.prototype);

WebhookModel.prototype.init = function(mongoose){
    
    this.schema = new mongoose.Schema({
        organizationId: { type: String, index: true },
        key: { type: String, index: true },
        url: { type: String, index: true },
        state: Number,
        created: Number
    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "webhook", this.schema);

}

WebhookModel.get = function(){
    
    return DatabaseManager.getModel('Webhook').model;
    
}

module["exports"] = WebhookModel;
