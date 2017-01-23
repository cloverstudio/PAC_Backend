/**  Hook Model */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');
var Utils = require("../lib/utils");

var BaseModel = require('./BaseModel');

var OrganizationSettings = function(){};

_.extend(OrganizationSettings.prototype,BaseModel.prototype);

OrganizationSettings.prototype.init = function(mongoose){
    
    this.schema = new mongoose.Schema({
        organizationId: { type: String, index: true },
        allowMultipleDevice: { type: Number }
    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "organization_settings", this.schema);

}

OrganizationSettings.get = function(){
    
    return DatabaseManager.getModel('OrganizationSettings').model;
    
}

module["exports"] = OrganizationSettings;
