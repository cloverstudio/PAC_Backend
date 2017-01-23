/**  Organization Model */

var _ = require('lodash');
var mongoose = require('mongoose');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');
var Utils = require("../lib/utils");

var BaseModel = require('./BaseModel');
var Organization = function(){};

_.extend(Organization.prototype,BaseModel.prototype);

Organization.prototype.init = function(mongoose){
    
    this.schema = new mongoose.Schema({
        name: String,
        sortName: String,
        created: Number,
        maxUserNumber: Number,
        maxGroupNumber: Number,
        maxRoomNumber: Number,
        diskQuota: Number,
        status: Number, // 1: Enabled, 0: Disabled
        organizationId: { type: String, index: true },
        logo: {
            picture: { 
                originalName: String,  
                size: Number, 
                mimeType: String,
                nameOnServer: String
            },
            thumbnail: { 
                originalName: String, 
                size: Number, 
                mimeType: String,
                nameOnServer: String
            }
        },
        email: String,
        diskUsage: Number // in bytes
    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "organization", this.schema);

}

Organization.get = function(){
    
    return DatabaseManager.getModel('Organization').model;
    
}

module["exports"] = Organization;
