/** Search history */

var _ = require('lodash');
var async = require('async');

var Const = require("../lib/consts");
var Utils = require('../lib/utils');
var GroupModel = require('../Models/Group');
var UserModel = require('../Models/User');
var RoomModel = require('../Models/Room');
var HistoryModel = require('../Models/History');
var GetUserOnlineStatus = require('./GetUserOnlineStatus');

var TotalUnreadCount = require('./TotalUnreadCount');

var SearchHistory = {

    search: function (lastUpdate, page, keyword, baseUser, pagingRows, onSuccess, onError) {

        var user = baseUser;

        var model = HistoryModel.get();

        async.waterfall([

            function (done) {

                var result = {};
                var query = null;

                if (lastUpdate > 0) {

                    query = model.find({
                        userId: user._id.toString(),
                        $or: [
                            { lastUpdate: { $gt: lastUpdate } },
                            { lastUpdateUnreadCount: { $gt: lastUpdate } }
                        ]
                    }).sort({ pinned: "desc", lastUpdate: "desc" });

                } else {

                    const conditions = {
                        userId: user._id.toString()
                    };

                    if (keyword) {
                        conditions.keyword = new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i")
                    }

                    if (!page || page < 1)
                        page = 0;

                    query = model.find(conditions)
                        .sort({ pinned: "desc", lastUpdate: "desc" })
                        .skip(pagingRows * page)
                        .limit(pagingRows);

                }


                query.exec(function (err, data) {

                    if (err) {
                        done(err, result);
                        return;
                    }

                    result.list = data.map(function (item) {
                        return item.toObject();
                    });

                    if (data.length > 100)
                        console.log(lastUpdate, data[100].toObject());

                    done(err, result);

                });

            },
            function (result, done) {

                var query = null;

                if (lastUpdate > 0) {

                    query = model.count({
                        userId: user._id.toString(),
                        $or: [
                            { lastUpdate: { $gt: lastUpdate } },
                            { lastUpdateUnreadCount: { $gt: lastUpdate } }
                        ]
                    }).sort({ pinned: "desc", lastUpdate: "desc" });

                } else {

                    const conditions = {
                        userId: user._id.toString()
                    };

                    if (keyword) {
                        conditions.keyword = new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i")
                    }

                    if (!page || page < 1)
                        page = 0;

                    query = model.count(conditions)
                        .sort({ pinned: "desc", lastUpdate: "desc" })

                }

                query.exec(function (err, countResult) {

                    result.count = countResult;
                    done(err, result);

                });

            },
            function (result, done) {

                // get users
                var userIds = _.pluck(_.filter(result.list, function (row) {
                    return row.chatType == Const.chatTypePrivate
                }), 'chatId');

                var model = UserModel.get();

                userIds = _.filter(userIds, (userId) => {

                    return Utils.isObjectId(userId);

                });

                model.find({
                    _id: { $in: userIds }
                }, function (err, findResult) {

                    _.forEach(result.list, function (row, index, alias) {

                        _.forEach(findResult, function (user) {

                            if (user._id == row.chatId) {

                                result.list[index].user = user.toObject();

                            }

                        });

                    });

                    // delete room which user is null
                    result.list = _.filter(result.list, function (row) {

                        if (row.chatType != Const.chatTypePrivate) {
                            return true;
                        }

                        return !_.isEmpty(row.user);

                    });

                    done(err, result);

                });

            },
            function (result, done) {

                // get groups
                var groupIds = _.pluck(_.filter(result.list, function (row) {
                    return row.chatType == Const.chatTypeGroup
                }), 'chatId');

                var model = GroupModel.get();

                model.find({
                    _id: { $in: groupIds }
                }, function (err, findResult) {

                    _.forEach(result.list, function (row, index, alias) {

                        _.forEach(findResult, function (group) {

                            if (group._id == row.chatId) {

                                result.list[index].group = group.toObject();

                            }

                        });

                    });

                    // delete room which user is null
                    result.list = _.filter(result.list, function (row) {

                        if (row.chatType != Const.chatTypeGroup) {
                            return true;
                        }

                        return !_.isEmpty(row.group);

                    });

                    done(null, result);

                });

            },

            function (result, done) {

                // get room
                var roomIds = _.pluck(_.filter(result.list, function (row) {
                    return row.chatType == Const.chatTypeRoom
                }), 'chatId');

                var model = RoomModel.get();

                model.find({
                    _id: { $in: roomIds }
                }, function (err, findResult) {

                    _.forEach(result.list, function (row, index, alias) {

                        _.forEach(findResult, function (room) {

                            if (room._id == row.chatId) {

                                result.list[index].room = room.toObject();

                            }

                        });

                    });

                    // delete room which room is null
                    result.list = _.filter(result.list, function (row) {

                        if (row.chatType != Const.chatTypeRoom) {
                            return true;
                        }

                        return !_.isEmpty(row.room);

                    });

                    done(null, result);

                });

            },
            function (result, done) {

                var userIdsFromGroup = [];

                // make sure at least 4 users from each history
                _.forEach(_.pluck(result.list, 'group.users'), function (row) {

                    if (!_.isArray(row))
                        return;

                    userIdsFromGroup = userIdsFromGroup.concat(row.slice(0, 4));

                });

                var userIdsFromRoom = [];

                // make sure at least 4 users from each history
                _.forEach(_.pluck(result.list, 'room.users'), function (row) {

                    if (!_.isArray(row))
                        return;

                    userIdsFromRoom = userIdsFromRoom.concat(row.slice(0, 4));

                });

                _.forEach(_.pluck(result.list, 'room.owner'), function (row) {

                    if (!row)
                        return;

                    userIdsFromRoom = userIdsFromRoom.concat(row);

                });

                var userIds = _.unique(userIdsFromGroup.concat(userIdsFromRoom));

                var model = UserModel.get();


                model.find(
                    {
                        _id: { $in: userIds }
                    },
                    UserModel.defaultResponseFields,
                    function (err, findResult) {

                        _.forEach(result.list, function (row, index, alias) {

                            if (row.chatType == Const.chatTypeGroup && (row.group && _.isArray(row.group.users))) {

                                var userModels = _.filter(findResult, function (userModel) {

                                    if (row.group.users.indexOf(userModel._id.toString()) != -1) {
                                        return true;
                                    }
                                });

                                alias[index].group.usersCount = alias[index].group.users.length;

                                alias[index].group.userModels = userModels.map(function (item) {
                                    return item.toObject();
                                });

                            }

                        });

                        _.forEach(result.list, function (row, index, alias) {

                            if (row.chatType == Const.chatTypeRoom && row.room) {

                                if (_.isArray(row.room.users)) {

                                    var userModels = _.filter(findResult, function (userModel) {

                                        if (row.room.users.indexOf(userModel._id.toString()) != -1) {
                                            return true;
                                        }

                                    });

                                    alias[index].room.usersCount = alias[index].room.users.length;

                                    alias[index].room.userModels = userModels.map(function (item) {
                                        return item.toObject();
                                    });

                                }


                                // get owner
                                alias[index].room.ownerModel = _.find(findResult, function (userModel) {

                                    return row.room.owner == userModel._id.toString();

                                });

                            }

                        });


                        done(err, result);

                    });


            },
            function (result, done) {

                TotalUnreadCount.get(user._id.toString(), function (err, unreadCount) {

                    result.totalUnreadCount = unreadCount;
                    done(err, result);

                });


            },
            function (result, done) {

                // get online status
                var userIds = _.map(_.pluck(result.list, 'user._id'), function (userIdObj) {
                    if (userIdObj)
                        return userIdObj.toString();
                });

                GetUserOnlineStatus.get(userIds, function (err, onlineStatusResult) {

                    _.forEach(result.list, function (historyObj, index) {

                        if (historyObj.user) {

                            var onlineStatusObj = _.find(onlineStatusResult, function (onlineStatusRow) {

                                return onlineStatusRow.userId == historyObj.user._id.toString();

                            });

                            if (onlineStatusObj)
                                result.list[index].user.onlineStatus = onlineStatusObj.onlineStatus;
                            else
                                result.list[index].user.onlineStatus = 0;
                        }

                    });

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


module["exports"] = SearchHistory;