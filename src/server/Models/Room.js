/**  Room Model */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');
var Utils = require("../lib/utils");

var BaseModel = require('./BaseModel');

var RoomModel = function () { };

_.extend(RoomModel.prototype, BaseModel.prototype);

RoomModel.prototype.init = function (mongoose) {

    this.schema = new mongoose.Schema({
        users: [],
        owner: { type: String, index: true },
        organizationId: { type: String, index: true },
        name: String,
        description: String,
        created: Number,
        modified: Number,
        lastMessage: {},
        type: Number,// 1:Private 2:Group 3:Public
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
            },
        },
    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "room", this.schema);

}

RoomModel.get = function () {

    return DatabaseManager.getModel('Room').model;

}

RoomModel.updateLastMessage = function (conversationId, messageObj) {

    var model = DatabaseManager.getModel('Room').model;

    model.update(
        { _id: conversationId },
        { lastMessage: messageObj },
        {},
        function (err, numAffected) {


        });

}

// class methods
RoomModel.getConversationListByUserId = function (userId, callBack) {

    var model = DatabaseManager.getModel('Room').model;
    var conversationList = [];

    model.find({ users: userId }, function (err, result) {

        if (err) throw err;

        async.forEachOf(result, function (conversation, key, done) {

            User.getUsersByIdForResponse(conversation.users, function (resultUsers) {

                conversation = conversation.toObject();
                conversation.users = resultUsers;
                conversationList.push(conversation);

                done(null);

            });

        }, function (err) {

            if (err)
                throw err;

            if (callBack)
                callBack(conversationList);

        });

    });

};


module["exports"] = RoomModel;
