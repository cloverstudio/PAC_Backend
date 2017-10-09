/**  User Model */

var _ = require('lodash');
var mongoose = require('mongoose');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');
var Utils = require("../lib/utils");

var BaseModel = require('./BaseModel');
var UserContacts = function () { };

_.extend(UserContacts.prototype, BaseModel.prototype);

UserContacts.prototype.init = function (mongoose) {

    this.schema = new mongoose.Schema({
        userId: { type: String, index: true },
        contact: [
            {
                id: { type: String, index: true },
                name: String
            }
        ]
    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "user_contacts", this.schema);

}

UserContacts.get = function () {

    return DatabaseManager.getModel('UserContacts').model;

}


UserContacts.getUsersById = function (userIds, callBack) {

    var model = this.get();

    model.find({ _id: { "$in": userIds } }, function (err, result) {

        if (callBack)
            callBack(err, result);

    });

};

module["exports"] = UserContacts;
