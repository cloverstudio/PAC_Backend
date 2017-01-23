/**  Group Model */

var _ = require('lodash');
var mongoose = require('mongoose');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');
var Utils = require("../lib/utils");

var BaseModel = require('./BaseModel');
var Group = function(){};

_.extend(Group.prototype,BaseModel.prototype);

Group.prototype.init = function(mongoose) {
    
    this.schema = new mongoose.Schema({
        name: String,
        sortName: { type: String, index: true },
        description: String,
        created: Number,
        avatar: {
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
        organizationId: { type: String, index: true },
        users: [ String ],
        parentId: { type: String, index: true },
        type: Number, // 1: Group, 2: Department
        default: Boolean // default department when new organization is created
    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "Group", this.schema);

}

Group.get = function(){
    
    return DatabaseManager.getModel('Group').model;
    
}

module["exports"] = Group;
