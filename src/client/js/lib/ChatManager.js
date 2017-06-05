var Backbone = require('backbone');
var _ = require('lodash');

var Const = require('./consts');
var Utils = require('./utils');
var Config = require('./init');

var AddToFavoriteClient = require('./APIClients/AddToFavoriteClient');
var RemoveFromFavoriteClient = require('./APIClients/RemoveFromFavoriteClient');
var UserDetailClient = require('./APIClients/UserDetailClient');

var loginUserManager = require('./loginUserManager');
var socketIOManager = require('./SocketIOManager');
var EncryptionManager = require('./EncryptionManager');

var UIUtils = require('../lib/UIUtils');
var ChatView = require('../Views/ChatView/ChatView.js'); 

var ChatManager = {
    
    isLoading: false,
    currentRoomId: null,
    chatView: null,
    open: function(roomId,messageId){
        
        var self = this;
        
        if(this.isLoading){
            console.log('blocked');
            return;
        }
        
        loginUserManager.currentConversation = roomId;
        
        var me = loginUserManager.getUser();
        
        var myAvatarURL = window.location.protocol + "//" + window.location.hostname;
        var port = location.port;
        
        if(port != 80){
            myAvatarURL += ":" + port;
        } 
        
        myAvatarURL += "/api/v2/avatar/user/";

        if(me.avatar && me.avatar.thumbnail)
            myAvatarURL += me.avatar.thumbnail.nameOnServer;
        
        Utils.goPage('main');
        
        $('#main-container').addClass('chat');
        
        $(document.body).addClass("loading");
        
        this.isLoading = true;
        
        var self = this;
        setTimeout(function(){
            self.isLoading = false;
        },10 * 1000);

        this.currentRoomId = roomId;

        if(this.chatView)
            this.chatView.destroy();

        this.chatView = new ChatView({
            container : "#main-container",
            roomId: roomId,
            autoLoadMessageId: messageId
        });

  
        Backbone.on(Const.NotificationChatLoaded, function(param){                        
            self.isLoading = false;
            $(document.body).removeClass("loading");
        });

    },
    
    openChatByUserId: function(userId,messageId){

        var self = this;

        UserDetailClient.send(userId,function(data){

            self.openChatByUser(data.user);

        });

    },
    openChatByUser: function(user,messageId){

        if(this.isLoading){
            console.log('blocked');
            return;
        }

        var me = loginUserManager.getUser();
        
        if(!me)
            return;
        
        var chatId = Utils.chatIdByUser(me,user);
        
        ChatManager.open(chatId,messageId);
        
        var url = "";
        
        if(user.avatar && user.avatar && user.avatar.thumbnail)
            url = "/api/v2/avatar/user/" + user.avatar.thumbnail.nameOnServer;

        loginUserManager.openChat({
            user: user
        });

        Backbone.trigger(Const.NotificationOpenChat,{
            user: user
        });
        
        Backbone.trigger(Const.NotificationUpdateHeader,{
            online: user.onlineStatus,
            img: url,
            title: user.name,
            description: user.description
        });

    },
    
    openChatByGroup : function(group,messageId){

        if(this.isLoading){
            console.log('blocked');
            return;
        }
        
        var roomId = Utils.chatIdByGroup(group);
        
        ChatManager.open(roomId,messageId);

        var url = "/api/v2/avatar/group/";
        
        if(group.avatar && group.avatar && group.avatar.thumbnail)
            url = "/api/v2/avatar/group/" + group.avatar.thumbnail.nameOnServer;
        
        loginUserManager.openChat({
            group: group
        });

        Backbone.trigger(Const.NotificationOpenChat,{
            group: group
        });
        
        Backbone.trigger(Const.NotificationUpdateHeader,{
            img: url,
            title: group.name,
            description: group.description
        });
        
    },
    
    openChatByRoom : function(room,messageId){

        if(this.isLoading){
            console.log('blocked');
            return;
        }
        
        var roomId = Utils.chatIdByRoom(room);

        ChatManager.open(roomId,messageId);
        
        var url = "/api/v2/avatar/room/";
        
        if(room.avatar && room.avatar && room.avatar.thumbnail)
            url = "/api/v2/avatar/room/" + room.avatar.thumbnail.nameOnServer;

        loginUserManager.openChat({
            room: room
        });

        Backbone.trigger(Const.NotificationOpenChat,{
            room: room
        });
        
        Backbone.trigger(Const.NotificationUpdateHeader,{
            img: url,
            title: room.name,
            description: room.description
        });

    },
    
    openChatByPrivateRoomId: function(roomId,messageId){

        if(this.isLoading){
            return;
        }
        
        var chatId = roomId;
        
        ChatManager.open(chatId,messageId);
        
        var roomIdSplitted = roomId.split('-');
        
        if(roomIdSplitted.length < 3)
            return;
            
        var user1 = roomIdSplitted[1];
        var user2 = roomIdSplitted[2];
        
        var targetUserId = user1;
        if(targetUserId == loginUserManager.user._id)
            targetUserId = user2;
            
        UserDetailClient.send(targetUserId,function(data){
            
            var user = data.user;
            var url = "/api/v2/avatar/user/";
            
            if(user.avatar && user.avatar && user.avatar.thumbnail)
                url = "/api/v2/avatar/user/" + user.avatar.thumbnail.nameOnServer;

            loginUserManager.openChat({
                user: user
            });
            
            Backbone.trigger(Const.NotificationUpdateHeader,{
                online: user.onlineStatus,
                img: Utils.getBaseURL() + url,
                title: user.name,
                description: user.description
            });
            
        },function(errorCode){
            
            UIUtils.handleAPIErrors(errorCode);
            
        });
        

    },
    
    close:function(){
        $('#main-container').removeClass('chat');
        $('#main-container').html('');

        $('#chat-detail').html('');
        $('#messages-tab').html('');
        $('#message-info-title').html('');
        $('#messages-tab-detail-panel').html('');

    },
    closeIfOpened:function(roomId){

        if(this.currentRoomId == roomId)
            this.close();

    }
    
}

module["exports"] = ChatManager;
