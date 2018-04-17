/** Search message */

var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');

var Utils = require('../lib/utils');
var GroupModel = require('../Models/Group');
var UserModel = require('../Models/User');
var OrganizationModel = require('../Models/Organization');
var MessageModel = require('../Models/Message');

var PermissionLogic = require('./Permission');
var PolulateMessageLogic = require('./PolulateMessage');

var SearchMessage = {

    search: function (baseUser, keyword, page, pagingRows, onSuccess, onError) {

        var messageModel = MessageModel.get();

        var regexMessage = RegExp("^.*" + Utils.escapeRegExp(keyword || "") + ".*$", "mi");

        async.waterfall([

            function (done) {

                var result = {
                    messages: [],
                    count: 0
                };

                // get groups joined
                PermissionLogic.getGroupsJoined(baseUser._id.toString(), function (groups) {

                    if (!groups)
                        groups = [];

                    result.groups = groups;

                    done(null, result)

                });

            },
            function (result, done) {

                // get rooms joined
                PermissionLogic.getRoomsJoined(baseUser._id.toString(), function (rooms) {

                    if (!rooms)
                        rooms = [];

                    result.rooms = rooms;

                    done(null, result)

                });

            },
            function (result, done) {

                var regexUserId = RegExp("^1.+" + baseUser._id.toString(), "i");

                //search private message
                messageModel.find({
                    $and: [
                        { roomID: { $regex: regexUserId } },
                        {
                            $or: [
                                { message: { $regex: regexMessage } },
                                { "file.file.name": { $regex: regexMessage } }
                            ]
                        }
                    ]
                }).limit(pagingRows).skip(pagingRows * page).exec(function (err, privateMessageFindResult) {

                    var objects = privateMessageFindResult.map(function (item) {
                        return item.toObject();
                    });

                    result.messages = result.messages.concat(objects);

                    // get counts
                    messageModel.count({
                        roomID: { $regex: regexUserId },
                        $or: [
                            { message: { $regex: regexMessage } },
                            { "file.file.name": { $regex: regexMessage } }
                        ]
                    }, function (err, privateMessageCountResult) {

                        result.count += privateMessageCountResult;

                        done(null, result);

                    });


                });

            },
            function (result, done) {

                var groupRoomIds = result.groups.map(function (groupId) {
                    return "2-" + groupId;
                });

                //search group message
                messageModel.find({
                    roomID: { $in: groupRoomIds },
                    $or: [
                        { message: { $regex: regexMessage } },
                        { "file.file.name": { $regex: regexMessage } }
                    ]
                }).limit(pagingRows).skip(pagingRows * page).exec(function (err, groupMessageFindResult) {

                    var objects = groupMessageFindResult.map(function (item) {
                        return item.toObject();
                    });

                    result.messages = result.messages.concat(objects);

                    // get counts
                    messageModel.count({
                        roomID: { $in: groupRoomIds },
                        $or: [
                            { message: { $regex: regexMessage } },
                            { "file.file.name": { $regex: regexMessage } }
                        ]
                    }, function (err, privateMessageCountResult) {

                        result.count += privateMessageCountResult;

                        done(null, result);

                    });

                });

            },
            function (result, done) {

                var roomRoomIds = _.map(result.rooms, function (roomId) {
                    return "3-" + roomId;
                });

                //search room message
                messageModel.find({
                    roomID: { $in: roomRoomIds },
                    $or: [
                        { message: { $regex: regexMessage } },
                        { "file.file.name": { $regex: regexMessage } }
                    ]
                }).limit(pagingRows).skip(pagingRows * page).exec(function (err, groupMessageFindResult) {

                    var objects = groupMessageFindResult.map(function (item) {
                        return item.toObject();
                    });

                    result.messages = result.messages.concat(objects);

                    // get counts
                    messageModel.count({
                        roomID: { $in: roomRoomIds },
                        $or: [
                            { message: { $regex: regexMessage } },
                            { "file.file.name": { $regex: regexMessage } }
                        ]
                    }, function (err, privateMessageCountResult) {

                        result.count += privateMessageCountResult;

                        done(null, result);

                    });

                });

            },
            function (result, done) {

                PolulateMessageLogic.populateEverything(result.messages, baseUser, function (newData) {

                    if (!newData) {
                        done("failed to populate message", result);
                        return;
                    }

                    result.message = newData;
                    done(null, result);

                });

            }

        ], function (err, result) {

            if (err)
                if (onError)
                    return onError(err);

            if (onSuccess)
                onSuccess(result);

        });
    }

};


module["exports"] = SearchMessage;