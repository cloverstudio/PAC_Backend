/**  Message Model */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');
var Utils = require("../lib/utils");

var BaseModel = require('./BaseModel');
var UserModel = require('./User');

var File = function(){};

_.extend(File.prototype,BaseModel.prototype);

File.prototype.init = function(mongoose){

    // Defining a schema
    this.schema = new mongoose.Schema({
        name: String,
        mimeType: String,
        size: Number,
        created: Number
    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "spika_files", this.schema);

}

File.get = function(){

    return DatabaseManager.getModel('File').model;

}

module["exports"] = File;
