/**  Search Room */

var _ = require('lodash');
var async = require('async');
var request = require('request');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var Utils = require("../lib/utils");

var DatabaseManager = require('../lib/DatabaseManager');
var EncryptionManager = require('../lib/EncryptionManager');

var MessageModel = require('../Models/Message');
var FavoriteModel = require('../Models/Favorite');
var WebhookModel = require('../Models/Webhook');
var UserModel = require('../Models/User');
var RoomModel = require('../Models/Room');
var GroupModel = require('../Models/Group');

var PolulateMessageLogic = require('../Logics/PolulateMessage');
var UpdateHistory = require('../Logics/UpdateHistory');

var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');

var MessageList = {

    get: function (userID, roomId, lastMessageId, direction, encrypt, onSuccess, onError) {

        var messageModel = MessageModel.get();
        const userModel = UserModel.get();

        async.waterfall([function (done) {

            if (direction == Const.MessageLoadDirection.prepend) {

                MessageModel.findOldMessages(roomId, lastMessageId, Const.pagingLimit, function (err, data) {

                    done(err, data);

                });

            }

            else if (direction == Const.MessageLoadDirection.append) {

                var limit = Const.pagingLimit;
                if (lastMessageId != 0)
                    limit = 0;

                MessageModel.findNewMessages(roomId, lastMessageId, limit, function (err, data) {

                    done(err, data);

                });

            }

            else if (direction == Const.MessageLoadDirection.appendNoLimit) {

                MessageModel.findAllMessages(roomId, lastMessageId, function (err, data) {

                    done(err, data);

                });

            }

        },
        function (messages, done) {

            if (_.isEmpty(messages))
                return done(null, messages);

            var sortDescMessages = _.sortByOrder(messages, ["created"], ["desc"]);

            var message = sortDescMessages[0];

            if (message.userID == userID || !_.isEmpty(message.seenBy))
                return done(null, messages);

            UpdateHistory.updateLastMessageStatus(message._id.toString(), false, true, false, (err) => {
                done(err, messages);
            });

        },
        function (messages, done) {

            // handle seen by

            var messagesToNotifyUpdate = [];

            if (messages.length == 0) {

                done(null, {
                    messagesToNotifyUpdate: [],
                    messages: []
                });

                return;
            }

            async.eachSeries(messages, (message, doneEach) => {

                var seenBy = message.seenBy;

                if (!seenBy)
                    seenBy = [];

                var isExist = _.find(seenBy, (seenByRow) => {

                    return userID == seenByRow.user;

                });

                if (!isExist && message.userID != userID) {

                    // add seenby
                    seenBy.push({
                        user: userID,
                        at: Utils.now(),
                        version: 2
                    });

                    message.seenBy = seenBy;
                    messagesToNotifyUpdate.push(message._id.toString());

                    messageModel.update({
                        _id: message._id
                    }, {
                            seenBy: seenBy
                        }, (err, updateResult) => {

                            doneEach(err);

                        });

                } else {

                    doneEach();

                }

            }, (err) => {

                done(null, {
                    messagesToNotifyUpdate: messagesToNotifyUpdate,
                    messages: messages
                });

            });

        },
        function (result, done) {

            var messages = result.messages;
            var messageIdsToNotify = result.messagesToNotifyUpdate;

            if (messages.length > 0) {

                MessageModel.populateMessages(messages, function (err, data) {

                    done(null, data);

                    // send notification

                    var messagesToNotify = _.filter(data, (obj) => {

                        return messageIdsToNotify.indexOf(obj._id.toString()) != -1

                    });

                    // notify if exists
                    if (messagesToNotify.length > 0) {

                        var roomID = messagesToNotify[0].roomID;
                        var chatType = roomID.split("-")[0];
                        var roomIDSplitted = roomID.split("-");

                        // websocket notification
                        if (chatType == Const.chatTypeGroup) {

                            SocketAPIHandler.emitToRoom(roomID, 'updatemessages', messagesToNotify);

                        } else if (chatType == Const.chatTypeRoom) {

                            SocketAPIHandler.emitToRoom(roomID, 'updatemessages', messagesToNotify);

                        } else if (chatType == Const.chatTypePrivate) {

                            var splitAry = roomID.split("-");

                            if (splitAry.length < 2)
                                return;

                            var user1 = splitAry[1];
                            var user2 = splitAry[2];

                            var toUser = null;
                            var fromUser = null;

                            if (user1 == userID) {
                                toUser = user2;
                                fromUser = user1;
                            } else {
                                toUser = user1;
                                fromUser = user2;
                            }

                            // send to user who got message
                            DatabaseManager.redisGet(Const.redisKeyUserId + toUser, function (err, redisResult) {

                                var socketIds = _.pluck(redisResult, "socketId");

                                if (!_.isArray(redisResult))
                                    return;

                                _.forEach(redisResult, function (socketIdObj) {
                                    SocketAPIHandler.emitToSocket(socketIdObj.socketId, 'updatemessages', messagesToNotify);
                                })

                            });

                        }

                    };

                });

            } else {

                done(null, messages);
            }


        },
        function (messages, done) {

            // add favorite

            var favoriteModel = FavoriteModel.get();

            favoriteModel.find({
                userId: userID
            }, function (err, favoriteFindResult) {

                var messageIds = _.map(favoriteFindResult, function (favorite) {

                    return favorite.messageId;

                });

                var messagesFav = _.map(messages, function (message) {

                    var isFavorite = 0;

                    if (messageIds.indexOf(message._id.toString()) != -1)
                        isFavorite = 1;

                    message.isFavorite = isFavorite;

                    return message;

                });

                done(null, {
                    messages: messagesFav
                });

            });

        }, function (result, done) {

            // update history
            UpdateHistory.resetUnreadCount({
                roomID: roomId,
                userID: userID
            });

            done(null, result);

        }, function (result, done) {

            // need organizationId
            var chatType = roomId.split("-")[0];
            var targetId = roomId.split("-")[1];

            if (chatType == Const.chatTypeGroup) {

                const groupModel = GroupModel.get();
                groupModel.findOne({
                    _id: targetId
                }, (err, findResult) => {

                    if (findResult) {

                        result.organizationId = findResult.organizationId;
                        result.group = findResult.toObject();;

                    }

                    done(null, result);

                });

            } else if (chatType == Const.chatTypeRoom) {

                const roomModel = RoomModel.get();
                roomModel.findOne({
                    _id: targetId
                }, (err, findResult) => {

                    if (findResult) {

                        result.room = findResult.toObject();

                        userModel.findOne({
                            _id: findResult.owner
                        }, (err, userFindResult) => {

                            if (userFindResult)
                                result.organizationId = userFindResult.organizationId;

                            done(null, result);

                        });

                    } else {
                        done(null, result);
                    }

                });

            } else if (chatType == Const.chatTypePrivate) {

                var splitAry = roomId.split("-");

                if (splitAry.length < 2)
                    return;

                var user1 = splitAry[1];
                var user2 = splitAry[2];

                var toUser = null;
                var fromUser = null;

                if (user1 == userID) {
                    toUser = user2;
                    fromUser = user1;
                } else {
                    toUser = user1;
                    fromUser = user2;
                }

                userModel.findOne({
                    _id: toUser
                }, (err, userFindResult) => {

                    if (userFindResult) {
                        result.organizationId = userFindResult.organizationId;
                        result.toUser = userFindResult.toObject();
                    }

                    done(null, result);

                });

            }

        },
        function (result, done) {

            userModel.findOne({
                _id: userID
            }, (err, userFindResult) => {

                if (userFindResult) {
                    result.fromUser = userFindResult.toObject();
                }

                done(null, result);

            });

        },
        function (result, done) {

            done(null, result);

            // send webhook if there is no message for first load
            if (
                direction == Const.MessageLoadDirection.append
                && lastMessageId == 0) {

                const webHookModel = WebhookModel.get();

                webHookModel.find({
                    organizationId: result.organizationId,
                    state: 1
                }, (err, webhooks) => {

                    if (!webhooks || webhooks.length == 0) {
                        return;
                    }

                    const requestbody = {
                        event: Const.webhookEventStartConversation,
                        roomId: roomId,
                        isFirst: result.messages.length == 0,
                        from: {
                            userid: result.fromUser.userid,
                            name: result.fromUser.name,
                            created: result.fromUser.created,
                            avatar: result.fromUser.avatar
                        }
                    };

                    if (result.toUser) {
                        requestbody.user = {
                            userid: result.toUser.userid,
                            name: result.toUser.name,
                            created: result.toUser.created,
                            avatar: result.toUser.avatar
                        };
                    }

                    if (result.room) {
                        requestbody.room = {
                            id: result.room._id.toString(),
                            name: result.room.name,
                            created: result.room.created,
                            owner: result.room.owner
                        };
                    }

                    if (result.group) {
                        requestbody.group = {
                            id: result.group._id.toString(),
                            name: result.group.name,
                            created: result.group.created
                        };
                    }

                    webhooks.forEach((webhook) => {

                        request.post({
                            url: webhook.url,
                            json: true,
                            body: requestbody,
                            headers: {
                                'User-Agent': 'spikawebhook',
                                'spika-key': webhook.key
                            },
                            timeout: 10
                        }, (err) => {

                        });

                    });

                });

            } else {
                done(null, result);
            }

        }
        ],
            function (err, result) {

                if (err) {
                    onError(err);
                    return;
                }

                // encrypt message

                if (encrypt) {

                    var encryptedMessages = _.map(result.messages, function (message) {

                        if (message.type == Const.messageTypeText) {
                            message.message = EncryptionManager.encryptText(message.message)
                        }

                        return message;

                    });

                    onSuccess(encryptedMessages);

                } else {

                    onSuccess(result.messages);

                }




            });

    }

};


module["exports"] = MessageList;

