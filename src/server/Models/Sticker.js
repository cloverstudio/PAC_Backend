/**  Sticker Model */

var _ = require('lodash');
var mongoose = require('mongoose');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');
var Utils = require("../lib/utils");

var BaseModel = require('./BaseModel');
var Sticker = function(){};

_.extend(Sticker.prototype, BaseModel.prototype);

Sticker.prototype.init = function(mongoose) {
    
    this.schema = new mongoose.Schema({
        name: String,
        sortName: String,
        description: String,
        created: Number,
        pictures: [],
        type: Number, // 1: Owner, 2: Admin
        organizationId: { type: String, index: true }
    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "Sticker", this.schema);

}

Sticker.get = function(){
    
    return DatabaseManager.getModel('Sticker').model;
    
}

module["exports"] = Sticker;
