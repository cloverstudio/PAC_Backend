var Backbone = require('backbone');
var _ = require('lodash');

var Utils = require('../../../lib/utils');
var UIUtils = require('../../../lib/UIUtils');
var Const = require('../../../lib/consts');
var Config = require('../../../lib/init');

var loginUserManager = require('../../../lib/loginUserManager');
var ChatManager = require('../../../lib/ChatManager');

var GroupListClient = require('../../../lib/APIClients/GroupListClient');
var GroupSearchClient = require('../../../lib/APIClients/GroupSearchClient');

var template = require('./GroupListView.hbs');
var templateContents = require('./GroupListContents.hbs');

var GroupListView = Backbone.View.extend({
    
    dataList: [],
    container : "",
    currentPage : 1,
    currentKeyword: "",
    isReachedToEnd: false,
    isLoading : false,
    lastBlockedSearchKeyword: "",
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
        
        $("#sidebar-grouplist .listview").on('scroll',function() {

            if(self.isLoading)
                return;
                
            // check is bottom
            if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                
                self.loadNext(self.currentKeyword);
                
            }
            
        });

       $("#tb-search-group").on('change keydown paste input',function() {

            var keyword = $(this).val();
            self.currentKeyword = keyword;
            
            self.resetResultAndLoadNext(self.currentKeyword);
            
        });

        Backbone.on(Const.NotificationRefreshGroup, function(){

            self.resetResultAndLoadNext(self.currentKeyword);

        });
        
        this.resetResultAndLoadNext(self.currentKeyword);
        
    },
    
    resetResultAndLoadNext: function(keyword){

        if(this.isLoading){
            this.lastBlockedSearchKeyword = keyword;
            return;
        }
        
        $("#sidebar-grouplist .listview").html("");
        this.dataList = [];
        this.currentPage = 1;
        this.isReachedToEnd = false;
        
        this.loadNext(keyword);
        
    },
    loadNext: function(keyword){
        
        if(this.isReachedToEnd)
            return;
            
        var self = this;
        
        this.isLoading = true;
        
        if(!_.isEmpty(keyword)){
            
            GroupSearchClient.send(keyword,this.currentPage,function(data){
                
                if(data.list.length == 0)
                    self.isReachedToEnd = true;
                    
                else{
                    
                    self.dataList = self.dataList.concat(data.list);
                    
                    self.currentPage++;
                    self.renderAppend(data.list); 

                }

                self.isLoading = false;

                if(!_.isEmpty(self.lastBlockedSearchKeyword)){
                    self.resetResultAndLoadNext(self.lastBlockedSearchKeyword);
                };
                self.lastBlockedSearchKeyword = "";
                
            },function(errorCode){
                
                console.log(errorCode);
                UIUtils.handleAPIErrors(errorCode);
                 self.isLoading = false;
            });
            
        }else{

            GroupListClient.send(this.currentPage,function(data){
                
                if(data.list.length == 0)
                    self.isReachedToEnd = true;
                    
                else{
                    
                    self.dataList = self.dataList.concat(data.list);
                    
                    self.currentPage++;
                    self.renderAppend(data.list); 

                }
                
                 self.isLoading = false;
                
            },function(errorCode){
                
                console.log(errorCode);
                UIUtils.handleAPIErrors(errorCode);
                
                self.isLoading = false;
            });
         
        }
        
    },
    
    renderAppend: function(list){
        
        var self = this;
        
        var html = templateContents({
            list: list
        });

        $("#sidebar-grouplist .listview").append(html);
        
        $('#sidebar-grouplist .chat-target').unbind().on('click',function(){
            
            var groupId = $(this).attr('id');
            
            self.startChat(groupId);
             
        });
    },
    startChat: function(groupId){
            
        var group = _.find(this.dataList, function(group) { return group._id == groupId; });
        
        ChatManager.openChatByGroup(group);
        
    },
    destroy: function(){
        
        Backbone.off(Const.NotificationRefreshGroup);
        
    }
    
});

module.exports = GroupListView;
