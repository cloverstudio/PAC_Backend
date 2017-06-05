var Backbone = require('backbone');
var _ = require('lodash');

var Utils = require('../../lib/utils');
var UIUtils = require('../../lib/UIUtils');
var Const = require('../../lib/consts');
var Config = require('../../lib/init');

var template = require('./SearchView.hbs');
var templateHeader = require('./SearchHeaderView.hbs');
var templateList = require('./SearchResult.hbs');

var loginUserManager = require('../../lib/loginUserManager');
var ChatManager = require('../../lib/ChatManager');

var searchMessageClient = require('../../lib/APIClients/SearchMessageClient');

var SideMenu = require('../SideMenu/SideMenu');

var SearchView = Backbone.View.extend({

    container : "",
    currentKeyword : "",
    currentPage : 1,
    isReachedToEnd: false,
    dataList : [],
    isLoading : false,
    lastSearchCall : null,
    initialize: function(options) {
        this.container = options.container;
        this.render();
    },

    render: function() {

        $(this.container).html(template({
            Config:Config
        }));

        this.onLoad();

        return this;

    },

    onLoad: function(){

        var self = this;

        Backbone.trigger(Const.NotificationCustomHeader,{
            html:templateHeader({})
        });

        $("#tb-search-message").on('change keydown paste input',function() {

            var keyword = $(this).val();
            self.currentKeyword = keyword;

            self.resetResultAndLoadNext(self.currentKeyword);

        });

        $("#search-result-contaier").on('scroll',function() {

            // check is bottom
            if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {

                self.loadNext(self.currentKeyword);

            }

        });

    },

    resetResultAndLoadNext : function(keyword){

        var self = this;

        if(this.isLoading){
            this.lastSearchCall = this.resetResultAndLoadNext;
            return;
        }
        
        this.currentPage = 1;
        this.isReachedToEnd = false;
        this.dataList = [];
        $("#search-result-contaier").html("");

        if(keyword == ""){
            return;
        }

        this.loadNext(keyword);

    },

   loadNext : function(keyword){

        var self = this;

        if(this.isReachedToEnd)
            return;

        if(keyword.length == 0)
            return;

        this.isLoading = true;

        searchMessageClient.send(keyword,this.currentPage,function(data){

            self.isLoading = false;

            // show nothing if first attemp and empty result
            if(data.messages.length == 0 && self.dataList.length == 0){
                self.renderAppend(data.messages);
            }

            if(self.lastSearchCall){
                self.lastSearchCall($("#tb-search-message").val());
                self.lastSearchCall = null;
                return;
            }

            if(data.messages.length == 0){
                self.isReachedToEnd = true;
                return;
            }

            self.dataList = self.dataList.concat(data.messages);
            self.currentPage++;
            self.renderAppend(data.messages);

            self.markKeyword(keyword);

        },function(errorCode){

            console.log(errorCode);
            UIUtils.handleAPIErrors(errorCode);

            self.isLoading = false;

        });

    },

    renderAppend : function(list){

        var self = this;

        var html = templateList({
            list: list
        });

        $("#search-result-contaier").append(html);

        $('#search-result-contaier .search-result-row').unbind().on('click',function(){

            var messageId = $(this).attr('id');
            self.startChat(messageId);

        });

    },

    markKeyword: function(keyword){

        $(".search-result-row .message-holder.new").each(function(){

            var text = $(this).html();
            
            var regex = new RegExp("[^>]" + Utils.escapeRegExp(keyword) + "[^<]","i");
            text = text.replace(regex,"<strong>" + keyword + "</strong>");

            $(this).html(text);

            $(this).removeClass('new');


        });

    },

    startChat: function(messageId){

        var messageObj = _.find(this.dataList,function(row){
            return row._id == messageId
        });

        if(messageObj.roomModel){

            ChatManager.openChatByRoom(messageObj.roomModel,messageId);

        }else if(messageObj.groupModel){

            ChatManager.openChatByGroup(messageObj.groupModel,messageId);

        }else {
            
            ChatManager.openChatByPrivateRoomId(messageObj.roomID,messageId);

        }

    }

});

module.exports = SearchView;
