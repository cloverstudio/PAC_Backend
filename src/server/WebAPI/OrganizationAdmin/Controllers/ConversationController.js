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
var OrganizationModel = require('../../../Models/Organization');

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
        var roomModel = RoomModel.get();

        var keyword = request.session.conversationUser2Keyword;

        var organizationId = baseUser.organizationId;
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);

        var criteria = {};
        criteria.organizationId = organizationId;

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

                if (err)
                    templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
                else
                    templateParams.list = result.messages;

                templateParams.firstUser = result.firstUser;
                templateParams.secondUser = result.secondUser;

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

    return router;
}

module["exports"] = new ConversationController();