var Backbone = require('backbone');
var _ = require('lodash');

var Utils = require('../../../lib/utils');
var UIUtils = require('../../../lib/UIUtils');
var Const = require('../../../lib/consts');
var Config = require('../../../lib/init');

var loginUserManager = require('../../../lib/loginUserManager');
var ChatManager = require('../../../lib/ChatManager');
var localzationManager = require('../../../lib/localzationManager');
var EncryptionManager = require('../../../lib/EncryptionManager');

var HistoryListClient = require('../../../lib/APIClients/HistoryListClient');
var MarkChatReadClient = require('../../../lib/APIClients/MarkChatAsReadClient');

var template = require('./HistoryListView.hbs');
var templateContents = require('./HistoryListContents.hbs');

var HistoryListView = Backbone.View.extend({
    
    dataList: [],
    container : "",
    currentPage : 1,
    isReachedToEnd: false,
    lastUpdate : 0,
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
        
        this.dataList = [];
        
        $("#sidebar-historylist .listview").on('scroll',function() {
            
            if(self.isLoading)
                return;


            // check is bottom
            if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                
                self.loadNext();
                
            }
            
        });

        Backbone.on(Const.NotificationRefreshHistory, function(){
            
            self.updateList();
            
        });

        Backbone.on(Const.NotificationRefreshHistoryLocally, function(obj){
            self.updateListWithoutLoading(obj);

            // reset unread count instead of loading message
            MarkChatReadClient.updateByMessage(obj);
        });

        Backbone.on(Const.NotificationRemoveRoom, function(obj){
            
            var newDataList = _.filter(self.dataList,function(historyObj){
	        	
	        	if(!obj.room || !historyObj.room)
	        		return true;
				
				if(obj.room._id == historyObj.room._id)
					return false;
				else
					return true;
	        	 
            });
            
            self.dataList = newDataList;
            self.updateList();
            
        });
        
        Backbone.on(Const.NotificationDeletedFromGroup, function(obj){

            self.dataList = [];
            self.currentPage = 1;
            self.updateList();
            
        });

        Backbone.on(Const.NotificationRemoveRoom, function(obj){

            self.dataList = [];
            self.currentPage = 1;
            self.updateList();
            
        });

        Backbone.on(Const.NotificationNewRoom, function(obj){

            self.dataList = [];
            self.currentPage = 1;
            self.updateList();
            
        });

        this.loadNext();
        
    },
    updateList: function(){

        var self = this;
        
        var lastUpdate = 0;

        if(this.dataList.length > 0){

            var sortByLastUpdate = _.sortBy(this.dataList,function(historyObj){
                
                return -1 * historyObj.lastUpdate;
                
            });
            
            lastUpdate = sortByLastUpdate[0].lastUpdate;
            
        }
        
        HistoryListClient.sendUpdate(lastUpdate,function(data){
            
            self.mergeData(data.list);
            self.renderList(); 
            
            let totalUnreadCount = 0;
            self.dataList.forEach( function(historyObj) {
                totalUnreadCount += historyObj.unreadCount;
            });

            Backbone.trigger(Const.NotificationUpdateUnreadCount,totalUnreadCount);
            
        },function(errorCode){
            
            UIUtils.handleAPIErrors(errorCode);
            
        });
        
    },
    updateListWithoutLoading: function(messageObj){

        var self = this;

        var historyObj = _.find(self.dataList,function(historyObj){

            var roomID = historyObj.chatType + "-" + historyObj.chatId;

            // generate roomID by users
            if(historyObj.chatType == Const.chatTypePrivate){
                roomID = Utils.chatIdByUser(loginUserManager.user,historyObj.user);
            }

            return roomID == messageObj.roomID;
            
        });

        if(historyObj){

            historyObj.lastUpdate = messageObj.created;
            if(messageObj.type == Const.messageTypeText)
                messageObj.message = EncryptionManager.decryptText(messageObj.message);

            historyObj.lastMessage = messageObj;

            self.mergeData([historyObj]);
            self.renderList(); 
            

        }

    },

    loadNext: function(){
        
        if(this.isReachedToEnd)
            return;
            
        var self = this;

        HistoryListClient.send(this.currentPage,function(data){
            
            if(data.list.length == 0)
                self.isReachedToEnd = true;
                
            else{
                
                if(self.currentPage == 1){
                    $("#sidebar-historylist .listview").html('');
                }
                
                self.mergeData(data.list);
                self.currentPage++;
                self.renderList(); 

            }
            
            Backbone.trigger(Const.NotificationUpdateUnreadCount,data.totalUnreadCount);
            
        },function(errorCode){
            
            UIUtils.handleAPIErrors(errorCode);
            
        });
            
        
    },
    
    mergeData : function(array){
        
        var self = this;
        
        _.forEach(array,function(updatedHistoryObj){
            
            var isNew = false;
            
            var existedObj = _.find(self.dataList,function(historyObj){
                
                return historyObj._id == updatedHistoryObj._id;
                 
            });
            
            if(!existedObj)
                isNew = true;
            
            if(isNew){

                self.dataList.push(updatedHistoryObj);
                
            }else{
                
                self.dataList = _.map(self.dataList,function(element){
                    
                    if(element._id == updatedHistoryObj._id)
                        return updatedHistoryObj;
                    else
                        return element;
                     
                });
                
            }
            
            
        });
        
        this.dataList = _.sortBy(this.dataList,function(historyObj){
            
            return -1 * historyObj.lastUpdate;
             
        });
        
        // make unread count to zero if user is opened the chat
        this.dataList = _.map(this.dataList,function(historyObj){
            
            var chatId = "";

            if(historyObj.chatType == Const.chatTypePrivate){
                
                chatId = Utils.chatIdByUser(historyObj.user,loginUserManager.user);
                
            }else if(historyObj.chatType == Const.chatTypeGroup){
    
                chatId = Utils.chatIdByGroup(historyObj.group);
                
            }else if(historyObj.chatType == Const.chatTypeRoom){
    
                chatId = Utils.chatIdByRoom(historyObj.room);
    
            }

            if(loginUserManager.currentConversation == chatId){

                // force zero locally and update to server
                historyObj.unreadCount = 0;
                
            }
                
            return historyObj;
             
        });
        
    },
    renderList: function(){
        
        var self = this;
        
        this.dataList = _.map(this.dataList,function(row){

            if(row.lastMessage){

                if(row.lastMessage.type == 2)
                    row.lastMessage.message = localzationManager.get("File");

                if(row.lastMessage.type == 3)
                    row.lastMessage.message = localzationManager.get("Location");

                if(row.lastMessage.type == 4)
                    row.lastMessage.message = localzationManager.get("Contact");

                if(row.lastMessage.type == 5)
                    row.lastMessage.message = localzationManager.get("Sticker");
        
                if(row.lastMessage.user) {
                    if (row.lastMessage.user._id.toString() == loginUserManager.user._id.toString())
                        row.currentUserIsSender = 1
                }
                else {
                    if (row.lastUpdateUser._id.toString() == loginUserManager.user._id.toString())
                        row.currentUserIsSender = 1
                }
                
            }
            
            return row;

        });

        var html = templateContents({
            list: this.dataList
        });
        
        $("#sidebar-historylist .listview").html(html);
        
        $('#sidebar-historylist .chat-target').unbind().on('click',function(){
            
            var historyId = $(this).attr('id');

            self.startChat(historyId);
             
        });
        
        
    },
    startChat: function(historyId){
        
        var historyObj = _.find(this.dataList,function(row){
            return row._id == historyId
        });
        
        if(!historyObj)
            return;
        
        if(historyObj.chatType == Const.chatTypePrivate){
            
            ChatManager.openChatByUser(historyObj.user);
            
        }else if(historyObj.chatType == Const.chatTypeGroup){

            ChatManager.openChatByGroup(historyObj.group);
            
        }else if(historyObj.chatType == Const.chatTypeRoom){

            ChatManager.openChatByRoom(historyObj.room);

        }

    },
    destroy: function(){
        
        Backbone.off(Const.NotificationRefreshHistory);
        Backbone.off(Const.NotificationRefreshHistoryLocally);
        Backbone.off(Const.NotificationRemoveRoom);
        
    }
    
    
});

module.exports = HistoryListView;
