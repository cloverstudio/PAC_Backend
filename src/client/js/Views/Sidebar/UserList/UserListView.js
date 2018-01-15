var Backbone = require('backbone');
var _ = require('lodash');

var Utils = require('../../../lib/utils');
var UIUtils = require('../../../lib/UIUtils');
var Const = require('../../../lib/consts');
var Config = require('../../../lib/init');

var loginUserManager = require('../../../lib/loginUserManager');
var ChatManager = require('../../../lib/ChatManager');

var UserListClient = require('../../../lib/APIClients/UserListClient');
var UserSearchClient = require('../../../lib/APIClients/UserSearchClient');

var localStorage = require('../../../lib/localstorageManager');

var template = require('./UserListView.hbs');
var templateContents = require('./UserListContents.hbs');

var UserListView = Backbone.View.extend({

    dataList: [],
    container: "",
    currentPage: 1,
    currentKeyword: "",
    isReachedToEnd: false,
    isLoading: false,
    lastBlockedSearchKeyword: "",
    initialize: function (options) {
        this.container = options.container;
        this.render();
    },

    render: function () {

        $(this.container).html(template({
            Config: Config
        }));

        this.onLoad();

        return this;

    },

    onLoad: function () {

        var self = this;

        $("#sidebar-userlist .listview").on('scroll', function () {

            if (self.isLoading)
                return;

            // check is bottom
            if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {

                self.loadNext(self.currentKeyword);

            }

        });

        $("#tb-search-user").on('keyup', function () {

            var keyword = $(this).val();
            self.currentKeyword = keyword;
            self.resetResultAndLoadNext(self.currentKeyword);

        });

        Backbone.on(Const.NotificationRefreshUser, function () {

            self.resetResultAndLoadNext(self.currentKeyword);

        });

        this.resetResultAndLoadNext(self.currentKeyword);

    },

    resetResultAndLoadNext: function (keyword) {

        if (this.isLoading) {
            this.lastBlockedSearchKeyword = keyword;
            return;
        }
        $("#sidebar-userlist .listview").html("");
        this.dataList = [];
        this.currentPage = 1;
        this.isReachedToEnd = false;

        this.loadNext(keyword);

    },
    loadNext: function (keyword) {

        if (this.isReachedToEnd)
            return;

        this.isLoading = true;

        var self = this;

        if (!_.isEmpty(keyword)) {

            UserSearchClient.send(keyword, this.currentPage, function (data) {

                if (data.list.length == 0)
                    self.isReachedToEnd = true;

                else {

                    self.dataList = self.dataList.concat(data.list);

                    self.currentPage++;
                    self.renderAppend(data.list);

                }

                self.isLoading = false;

            }, function (errorCode) {

                console.log(errorCode);
                UIUtils.handleAPIErrors(errorCode);

                self.isLoading = false;
                self.lastBlockedSearchKeyword = "";

            });

        } else {

            UserListClient.send(this.currentPage, function (data) {

                if (data.list.length == 0)
                    self.isReachedToEnd = true;

                else {

                    self.dataList = self.dataList.concat(data.list);

                    self.currentPage++;
                    self.renderAppend(data.list);

                }

                self.isLoading = false;

                if (!_.isEmpty(self.lastBlockedSearchKeyword)) {
                    self.resetResultAndLoadNext(self.lastBlockedSearchKeyword);
                };
                self.lastBlockedSearchKeyword = "";

            }, function (errorCode) {

                console.log(errorCode);
                UIUtils.handleAPIErrors(errorCode);

                self.isLoading = false;
                self.lastBlockedSearchKeyword = "";
            });

        }

    },

    renderAppend: function (list) {

        var self = this;

        var html = templateContents({
            list: list
        });

        $("#sidebar-userlist .listview").append(html);

        $('#sidebar-userlist .chat-target').unbind().on('click', function () {

            var userId = $(this).attr('id');

            self.startChat(userId);

        });

    },
    startChat: function (userId) {

        var user = _.find(this.dataList, function (user) { return user._id == userId; });

        if (!user)
            return;

        localStorage.set(Const.LocalStorageKeyLastOpenChatId, userId);
        localStorage.set(Const.LocalStorageKeyLastOpenSidebarTab, Const.sidebarTab.users);

        ChatManager.openChatByUser(user);

    },
    destroy: function () {

        Backbone.off(Const.NotificationRefreshUser);

    }

});

module.exports = UserListView;
