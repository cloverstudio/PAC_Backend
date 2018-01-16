/** Called for URL /admin/home */

var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');
var JSON = require('JSON2');
var async = require('async');

var Const = require("../../../lib/consts");
var Config = require("../../../lib/init");
var BackendBaseController = require("./BackendBaseController");
var DatabaseManager = require('../../../lib/DatabaseManager');
var Utils = require('../../../lib/utils');

var checkUserAdmin = require('../../../lib/auth.js').checkUserAdmin;

var UserModel = require('../../../Models/User');
var GroupModel = require('../../../Models/Group');
var RoomModel = require('../../../Models/Room');
var MessageModel = require('../../../Models/Message');
var HistoryModel = require('../../../Models/History');
var FileModel = require('../../../Models/File');
var FavoriteModel = require('../../../Models/Favorite');
var OrganizationModel = require('../../../Models/Organization');

var PermissionLogic = require('../../../Logics/Permission');

var ConversationController = function () {
}

// extends from basecontroller
_.extend(ConversationController.prototype, BackendBaseController.prototype);

ConversationController.prototype.init = function (app) {

    var self = this;
    var menuItemName = "conversation";

    // first step of user
    router.get('/user', checkUserAdmin, function (request, response) {

        var templateParams = {
            page: menuItemName,
            openMenu: menuItemName
        };

        var page = request.query.page;
        if (!page)
            page = 1;

        var keyword = request.query.keyword;

        // if keyrord is exist save to session and redirect to same page
        if (keyword != undefined) {
            request.session.conversationUser1Keyword = keyword;
            return response.redirect('/admin/conversation/user');
        }

        var baseUser = request.session.user;
        var organizationModel = OrganizationModel.get();
        var userModel = UserModel.get();
        var groupModel = GroupModel.get();
        var roomModel = RoomModel.get();

        var keyword = request.session.conversationUser1Keyword;

        var organizationId = baseUser.organizationId;
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);

        var criteria = {};
        criteria.organizationId = organizationId;
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);

        if (!organizationAdmin) {
            criteria.groups = { $in: baseUser.groups };
            criteria._id = { $ne: baseUser._id };
        }

        if (!_.isEmpty(keyword)) {
            criteria.name = new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i");
        }

        async.waterfall([

            function (done) {

                var result = {};

                userModel.find(criteria).
                    limit(Const.pagingRows).
                    skip((page - 1) * Const.pagingRows).
                    sort({ created: "asc" }).
                    exec(function (err, findUsers) {

                        result.list = findUsers;
                        done(err, result);

                    });

            },
            function (result, done) {

                // get count
                userModel.count(criteria, function (err, countResult) {

                    result.count = countResult;
                    done(null, result);

                });

            }
        ],
            function (err, result) {

                if (err)
                    templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
                else
                    templateParams.list = result.list;

                var listCountFrom = (result.count) ? Const.pagingRows * (page - 1) + 1 : result.count;
                var listCountTo = (Const.pagingRows * page > result.count) ? result.count : Const.pagingRows * page;

                templateParams.paging = {

                    page: page,
                    count: result.count,
                    listCountFrom: listCountFrom,
                    listCountTo: listCountTo,
                    rows: Const.pagingRows,
                    baseURL: "/admin/conversation/user?page="

                }

                templateParams.keyword = keyword;

                self.render(request, response, '/Conversation/User', templateParams);

            });

    });

    // second step of user
    router.get('/user/:userId', checkUserAdmin, function (request, response) {

        var firstUserId = request.params.userId;
        if (!firstUserId) {
            return response.redirect('/admin/conversation/user/');
        }

        var templateParams = {
            page: menuItemName,
            openMenu: menuItemName
        };

        var page = request.query.page;
        if (!page)
            page = 1;

        var keyword = request.query.keyword;

        // if keyrord is exist save to session and redirect to same page
        if (keyword != undefined) {
            request.session.conversationUser2Keyword = keyword;
            return response.redirect('/admin/conversation/user/' + firstUserId);
        }

        var baseUser = request.session.user;
        var organizationModel = OrganizationModel.get();
        var userModel = UserModel.get();
        var groupModel = GroupModel.get();
        var messageModel = MessageModel.get();
        var roomModel = RoomModel.get();

        var keyword = request.session.conversationUser2Keyword;

        var organizationId = baseUser.organizationId;
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);

        var criteria = {};
        criteria.organizationId = organizationId;
        criteria._id = { $ne: firstUserId };

        if (!organizationAdmin) {
            criteria.groups = { $in: baseUser.groups };
            criteria._id = { $ne: baseUser._id };
        }

        if (!_.isEmpty(keyword)) {
            criteria.name = new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i");
        }

        async.waterfall([

            function (done) {

                var result = {};
                userModel.findOne({
                    _id: firstUserId
                }).

                    exec(function (err, findUser) {

                        if (!findUser) {
                            return response.redirect('/admin/conversation/user/');
                        }

                        result.firstUser = findUser;
                        done(err, result);
                    });

            },
            function (result, done) {

                var searchId = new RegExp('^.*' + Utils.escapeRegExp(firstUserId) + '.*$', "i");
                var privateConversation = new RegExp('^.*' + Utils.escapeRegExp("1") + '.*$', "i");

                messageModel.find({
                    $and: [
                        { roomID: searchId },
                        { roomID: privateConversation }
                    ]
                }).

                    exec(function (err, findMessages) {

                        if (!findMessages) {
                            return response.redirect('/admin/conversation/user/');
                        }

                        result.findMessages = findMessages;
                        done(err, result);
                    });

            },
            function (result, done) {

                userModel.find(criteria).
                    limit(Const.pagingRows).
                    skip((page - 1) * Const.pagingRows).
                    sort({ created: "asc" }).
                    exec(function (err, findUsers) {
                        result.listAll = findUsers;
                        done(err, result);
                    });

            },
            function (result, done) {

                result.list = []
                var uniqMsgs = _.uniq(result.findMessages, "roomID");

                for (var i = 0; i < uniqMsgs.length; i++) {

                    for (var j = 0; j < result.listAll.length; j++) {

                        if (uniqMsgs[i].roomID.indexOf(result.listAll[j]._id) != -1) {

                            result.list.push(result.listAll[j])

                        }

                    }

                }

                done(null, result);

            },
            function (result, done) {

                // get count
                userModel.count(criteria, function (err, countResult) {

                    result.count = countResult;
                    done(null, result);

                });

            }
        ],
            function (err, result) {

                if (err)
                    templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
                else
                    templateParams.list = result.list;

                templateParams.firstUser = result.firstUser;

                var listCountFrom = (result.count) ? Const.pagingRows * (page - 1) + 1 : result.count;
                var listCountTo = (Const.pagingRows * page > result.count) ? result.count : Const.pagingRows * page;

                templateParams.paging = {
                    page: page,
                    count: result.count,
                    listCountFrom: listCountFrom,
                    listCountTo: listCountTo,
                    rows: Const.pagingRows,
                    baseURL: "/admin/conversation/user/" + firstUserId + "?page="
                }

                templateParams.keyword = keyword;

                self.render(request, response, '/Conversation/User', templateParams);

            });

    });


    // second user id selected
    router.get('/user/:userId1/:userId2', checkUserAdmin, function (request, response) {

        var firstUserId = request.params.userId1;
        if (!firstUserId) {
            return response.redirect('/admin/conversation/user/');
        }

        var secondUserId = request.params.userId2;
        if (!secondUserId) {
            return response.redirect('/admin/conversation/user/' + firstUserId);
        }

        var templateParams = {
            page: menuItemName,
            openMenu: menuItemName
        };

        var page = request.query.page;
        if (!page)
            page = 1;

        var keyword = request.query.keyword;

        // if keyrord is exist save to session and redirect to same page
        if (keyword != undefined) {
            request.session.conversationMessageKeyword = keyword;
            return response.redirect('/admin/conversation/user/' + firstUserId + "/" + secondUserId);
        }

        var baseUser = request.session.user;
        var organizationModel = OrganizationModel.get();
        var userModel = UserModel.get();
        var groupModel = GroupModel.get();
        var roomModel = RoomModel.get();
        var messageModel = MessageModel.get();

        var keyword = request.session.conversationMessageKeyword;

        var organizationId = baseUser.organizationId;
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);

        async.waterfall([

            function (done) {

                var result = {};

                userModel.findOne({
                    _id: firstUserId
                }).

                    exec(function (err, findUser) {

                        if (!findUser) {
                            return response.redirect('/admin/conversation/user/');
                        }

                        result.firstUser = findUser;
                        done(err, result);
                    });

            },
            function (result, done) {

                userModel.findOne({
                    _id: secondUserId
                }).

                    exec(function (err, findUser) {

                        if (!findUser) {
                            return response.redirect('/admin/conversation/user/');
                        }

                        result.secondUser = findUser;
                        done(err, result);
                    });

            },
            function (result, done) {

                // get conversation
                // create chat id
                const roomID = Utils.chatIdByUser(result.firstUser, result.secondUser);

                result.criteria = {
                    roomID: roomID
                }

                if (keyword && keyword.length > 0) {
                    result.criteria.message = RegExp("^.*" + Utils.escapeRegExp(keyword) + ".*$", "mi");
                }

                messageModel.find(result.criteria).
                    limit(Const.pagingRows).
                    skip((page - 1) * Const.pagingRows).
                    sort({ created: "desc" }).
                    exec(function (err, findMeesages) {
                        result.messages = findMeesages;
                        done(err, result);
                    });

            },
            function (result, done) {

                // get conversation
                // create chat id
                const roomID = Utils.chatIdByUser(result.firstUser, result.secondUser);

                messageModel.count(result.criteria, (err, messageCounts) => {
                    result.count = messageCounts;
                    done(err, result);
                });

            },

            function (result, done) {

                MessageModel.populateMessages(result.messages, (err, messages) => {
                    result.messages = messages;
                    done(err, result);
                });

            }
        ],

            function (err, result) {

                const roomID = Utils.chatIdByUser(result.firstUser, result.secondUser);

                if (err)
                    templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
                else
                    templateParams.list = result.messages;

                templateParams.firstUser = result.firstUser;
                templateParams.secondUser = result.secondUser;
                templateParams.roomID = roomID;

                var listCountFrom = (result.count) ? Const.pagingRows * (page - 1) + 1 : result.count;
                var listCountTo = (Const.pagingRows * page > result.count) ? result.count : Const.pagingRows * page;

                templateParams.paging = {
                    page: page,
                    count: result.count,
                    listCountFrom: listCountFrom,
                    listCountTo: listCountTo,
                    rows: Const.pagingRows,
                    baseURL: "/admin/conversation/user/" + firstUserId + "/" + secondUserId + "?page="
                }

                templateParams.keyword = keyword;

                self.render(request, response, '/Conversation/User', templateParams);

            });

    });

    router.get('/group', checkUserAdmin, function (request, response) {

        var templateParams = {
            page: menuItemName,
            openMenu: menuItemName
        };

        var page = request.query.page;
        if (!page)
            page = 1;

        var keyword = request.query.keyword;

        // if keyrord is exist save to session and redirect to same page
        if (keyword != undefined) {
            request.session.conversationUser3Keyword = keyword;
            return response.redirect('/admin/conversation/group');
        }

        var baseUser = request.session.user;
        var organizationModel = OrganizationModel.get();
        var userModel = UserModel.get();
        var groupModel = GroupModel.get();
        var roomModel = RoomModel.get();

        var keyword = request.session.conversationUser3Keyword;

        var organizationId = baseUser.organizationId;
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);

        var criteria = {};
        criteria.organizationId = organizationId;
        criteria.type = 1;
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);

        if (!organizationAdmin) {
            criteria.groups = { $in: baseUser.groups };
            criteria._id = { $ne: baseUser._id };
        }

        if (!_.isEmpty(keyword)) {
            criteria.name = new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i");
        }

        async.waterfall([

            function (done) {

                var result = {};

                groupModel.find(criteria).
                    limit(Const.pagingRows).
                    skip((page - 1) * Const.pagingRows).
                    sort({ created: "asc" }).
                    exec(function (err, findGroups) {

                        result.list = findGroups;
                        done(err, result);
                    });

            },
            function (result, done) {

                // get count
                groupModel.count(criteria, function (err, countResult) {

                    result.count = countResult;
                    done(null, result);

                });

            }
        ],
            function (err, result) {

                if (err)
                    templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
                else
                    templateParams.list = result.list;

                var listCountFrom = (result.count) ? Const.pagingRows * (page - 1) + 1 : result.count;
                var listCountTo = (Const.pagingRows * page > result.count) ? result.count : Const.pagingRows * page;

                templateParams.paging = {

                    page: page,
                    count: result.count,
                    listCountFrom: listCountFrom,
                    listCountTo: listCountTo,
                    rows: Const.pagingRows,
                    baseURL: "/admin/conversation/group?page="

                }

                templateParams.keyword = keyword;

                self.render(request, response, '/Conversation/Group', templateParams);

            });

    });

    // group id selected
    router.get('/group/:groupId', checkUserAdmin, function (request, response) {

        var groupId = request.params.groupId;
        var templateParams = {
            page: menuItemName,
            openMenu: menuItemName
        };

        var page = request.query.page;
        if (!page)
            page = 1;

        var keyword = request.query.keyword;

        // if keyword exists, save it to session and redirect to same page
        if (keyword != undefined) {
            request.session.conversationUser4Keyword = keyword;
            return response.redirect('/admin/conversation/group/' + groupId);
        }

        var baseUser = request.session.user;
        var organizationModel = OrganizationModel.get();
        var userModel = UserModel.get();
        var groupModel = GroupModel.get();
        var roomModel = RoomModel.get();
        var messageModel = MessageModel.get();

        var keyword = request.session.conversationUser4Keyword;

        var organizationId = baseUser.organizationId;
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);

        async.waterfall([

            function (done) {

                var result = {};

                groupModel.findOne({
                    _id: groupId
                }).

                    exec(function (err, findGroup) {

                        if (!findGroup) {
                            return response.redirect('/admin/conversation/group/');
                        }

                        result.selectedGroup = findGroup;
                        done(err, result);
                    });

            },
            function (result, done) {

                result.criteria = {
                    roomID: Const.chatTypeGroup + "-" + result.selectedGroup._id
                }

                if (keyword && keyword.length > 0) {
                    result.criteria.message = RegExp("^.*" + Utils.escapeRegExp(keyword) + ".*$", "mi");
                }

                messageModel.find(result.criteria).
                    limit(Const.pagingRows).
                    skip((page - 1) * Const.pagingRows).
                    sort({ created: "desc" }).
                    exec(function (err, findMeesages) {
                        result.messages = findMeesages;
                        result.count = findMeesages.length;
                        done(err, result);
                    });


            },
            function (result, done) {

                MessageModel.populateMessages(result.messages, (err, messages) => {
                    result.messages = messages;
                    done(err, result);
                });

            }
        ],

            function (err, result) {

                if (err)
                    templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
                else
                    templateParams.message = result.messages;

                templateParams.selectedGroup = result.selectedGroup;

                var listCountFrom = (result.count) ? Const.pagingRows * (page - 1) + 1 : result.count;
                var listCountTo = (Const.pagingRows * page > result.count) ? result.count : Const.pagingRows * page;

                templateParams.paging = {
                    page: page,
                    count: result.count,
                    listCountFrom: listCountFrom,
                    listCountTo: listCountTo,
                    rows: Const.pagingRows,
                    baseURL: "/admin/conversation/group/" +
                        groupId + "?page="
                }

                templateParams.keyword = keyword;

                self.render(request, response, '/Conversation/Group', templateParams);

            });

    });

    router.get('/room', checkUserAdmin, function (request, response) {

        var templateParams = {
            page: menuItemName,
            openMenu: menuItemName
        };

        var page = request.query.page;
        if (!page)
            page = 1;

        var keyword = request.query.keyword;

        // if keyword exists, save it to session and redirect to same page
        if (keyword != undefined) {
            request.session.conversationUser5Keyword = keyword;
            return response.redirect('/admin/conversation/room');
        }

        var baseUser = request.session.user;
        var organizationModel = OrganizationModel.get();
        var userModel = UserModel.get();
        var groupModel = GroupModel.get();
        var roomModel = RoomModel.get();

        var keyword = request.session.conversationUser5Keyword;

        var organizationId = baseUser.organizationId;
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);

        var criteria = {};
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);

        if (!organizationAdmin) {
            criteria.groups = { $in: baseUser.groups };
            criteria._id = { $ne: baseUser._id };
        }

        if (!_.isEmpty(keyword)) {
            criteria.name = new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i");
        }

        async.waterfall([

            function (done) {

                var result = {};

                roomModel.find(criteria).
                    limit(Const.pagingRows).
                    skip((page - 1) * Const.pagingRows).
                    sort({ created: "asc" }).
                    exec(function (err, findRooms) {

                        result.list = findRooms;
                        done(err, result);

                    });

            },
            function (result, done) {

                // get count
                roomModel.count(criteria, function (err, countResult) {

                    result.count = countResult;
                    done(null, result);

                });

            }
        ],
            function (err, result) {

                if (err)
                    templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
                else
                    templateParams.list = result.list;

                var listCountFrom = (result.count) ? Const.pagingRows * (page - 1) + 1 : result.count;
                var listCountTo = (Const.pagingRows * page > result.count) ? result.count : Const.pagingRows * page;

                templateParams.paging = {

                    page: page,
                    count: result.count,
                    listCountFrom: listCountFrom,
                    listCountTo: listCountTo,
                    rows: Const.pagingRows,
                    baseURL: "/admin/conversation/room?page="

                }

                templateParams.keyword = keyword;

                self.render(request, response, '/Conversation/Room', templateParams);

            });

    });

    // room id selected
    router.get('/room/:roomId', checkUserAdmin, function (request, response) {

        var roomId = request.params.roomId;
        var templateParams = {
            page: menuItemName,
            openMenu: menuItemName
        };

        var page = request.query.page;
        if (!page)
            page = 1;

        var keyword = request.query.keyword;

        // if keyword exists, save it to session and redirect to same page
        if (keyword != undefined) {
            request.session.conversationUser6Keyword = keyword;
            return response.redirect('/admin/conversation/room/' + roomId);
        }

        var baseUser = request.session.user;
        var organizationModel = OrganizationModel.get();
        var userModel = UserModel.get();
        var groupModel = GroupModel.get();
        var roomModel = RoomModel.get();
        var messageModel = MessageModel.get();

        var keyword = request.session.conversationUser6Keyword;

        var organizationId = baseUser.organizationId;
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);

        async.waterfall([

            function (done) {

                var result = {};

                roomModel.findOne({
                    _id: roomId
                }).

                    exec(function (err, findRoom) {

                        if (!findRoom) {
                            return response.redirect('/admin/conversation/room');
                        }

                        result.selectedRoom = findRoom;
                        done(err, result);

                    });

            },
            function (result, done) {

                result.criteria = {
                    roomID: Const.chatTypeRoom + "-" + result.selectedRoom._id
                }

                if (keyword && keyword.length > 0) {
                    result.criteria.message = RegExp("^.*" + Utils.escapeRegExp(keyword) + ".*$", "mi");
                }

                messageModel.find(result.criteria).
                    limit(Const.pagingRows).
                    skip((page - 1) * Const.pagingRows).
                    sort({ created: "desc" }).
                    exec(function (err, findMeesages) {

                        result.messages = findMeesages;
                        result.count = findMeesages.length;
                        done(err, result);

                    });


            },

            function (result, done) {

                MessageModel.populateMessages(result.messages, (err, messages) => {
                    result.messages = messages;
                    done(err, result);
                });

            }
        ],

            function (err, result) {

                if (err)
                    templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
                else
                    templateParams.message = result.messages;

                templateParams.selectedRoom = result.selectedRoom;

                var listCountFrom = (result.count) ? Const.pagingRows * (page - 1) + 1 : result.count;
                var listCountTo = (Const.pagingRows * page > result.count) ? result.count : Const.pagingRows * page;

                templateParams.paging = {
                    page: page,
                    count: result.count,
                    listCountFrom: listCountFrom,
                    listCountTo: listCountTo,
                    rows: Const.pagingRows,
                    baseURL: "/admin/conversation/group/" +
                        roomId + "?page="
                }

                templateParams.keyword = keyword;

                self.render(request, response, '/Conversation/Room', templateParams);

            });

    });


    router.post('/delete/:_id', checkUserAdmin, function (request, response) {

        var roomID = request.params._id;
        var baseUser = request.session.user;

        var templateParams = {
            page: menuItemName,
            openMenu: menuItemName
        };

        var messageModel = MessageModel.get();
        var historyModel = HistoryModel.get();
        var fileModel = FileModel.get();
        var favoriteModel = FavoriteModel.get();
        var result = {};


        async.waterfall([

            function (done) {

                result.foundMeesages = [];
                result.messageIds = [];
                result.fileIds = [];
                result.fileSize = Number;

                messageModel.find({ roomID: roomID }, function (err, findResults) {

                    if (!findResults) {
                        response.redirect('/admin/conversation/users');
                        return;
                    }

                    result.foundMeesages = findResults;

                    done(err, result);

                });

            },
            function (result, done) {

                result.foundMeesages.forEach(msg => {

                    result.messageIds.push(msg._id);

                    if (msg.file && msg.file.file.id) {

                        result.fileIds.push(msg.file.file.id);

                    }

                    if (msg.file.thumb.id) {

                        result.fileIds.push(msg.file.thumb.id);

                    }

                });

                console.log("MessagesID", result.messageIds)
                console.log("fileIds", result.fileIds)

                fileModel.remove({ _id: { $in: result.fileIds } }, function (err, findResults) {
                    console.log(findResults);
                    done(err, result);

                })

            }

        ],
            function (err, result) {

                if (err) {

                    templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;


                    self.render(request, response, '/Conversation/Delete', templateParams);

                    return;
                }

                response.redirect('/admin/conversation/user?delete=1');

            });

    });

    return router;
}

module["exports"] = new ConversationController();