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

var ChatManager = {
    
    isLoading: false,
    currentRoomId: null,
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
        
        SpikaAdapter.functions.leaveCurrentRoom();
        
        $('#main-container').addClass('chat');
        
        $(document.body).addClass("loading");
        this.isLoading = true;
        
        var self = this;
        setTimeout(function(){
            self.isLoading = false;
        },10 * 1000);

        this.currentRoomId = roomId;

	    SpikaAdapter.attach({
	        mode: "div", 
            spikaURL: Config.SpikaBaseURL,
            attachTo : "main-container",
            socketIOConnection : socketIOManager.io,
            messageId: messageId,
            user : {
                id : me._id,
                name : me.name,
                avatarURL : myAvatarURL,
                roomID : roomId
            },
            config : {
                apiBaseUrl : window.location.origin + Config.SpikaBaseURL + "/v1",
                socketUrl : Config.SpikaSocketURL,
                showSidebar : false,
                showTitlebar : false,
                useBothSide: false
            },
            listener : {

                onPageLoad: function(){
                    
                    self.isLoading = false;
                    $(document.body).removeClass("loading");
                    Backbone.trigger(Const.NotificationRefreshHistory);
                    
                    
                },
                onNewMessage:function(obj){
                    
                },
                onNewUser:function(obj){

                },
                onUserLeft:function(obj){

                },
                OnUserTyping:function(obj){

                },
                OnMessageChanges:function(obj){

                },
                onOpenMessage:function(obj){
                    return true;
                },
                OnOpenFile:function(obj){
                    return true;
                },
                onSelectMessage:function(obj){

                    Backbone.trigger(Const.NotificationSelectMessage,{
                        messsage: obj
                    });
        
                }
            },
            functions : {
                
                addToFavorite: function(messageId,callBack){

                    AddToFavoriteClient.send(messageId,function(data){
                        
                        callBack(data);
                        
                    },function(errCode){
                        var UIUtils = require('./UIUtils');
                        UIUtils.handleAPIErrors(errCode);
                    });

                },
                removeFromFavorite: function(messageId,callBack){

                    RemoveFromFavoriteClient.send(messageId,function(data){
                        
                        callBack(data);
                        
                    },function(errCode){
                        var UIUtils = require('./UIUtils');
                        UIUtils.handleAPIErrors(errCode);
                    });

                },
                forwardMessage : function(messageId,callBack){
                    var ForwardMessageDialog = require("../Views/Modals/ForwardMessage/ForwardMessageDialog")
                    ForwardMessageDialog.show(messageId);
                    
                },
                encryptMessage : function(text){
                    
                    return EncryptionManager.encryptText(text);

                },
                decryptMessage : function(text){
                    
                    return EncryptionManager.decryptText(text);

                }
                
            }

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
        
        /*

        
        */
        
    },
    
    close:function(){
        $('#main-container').removeClass('chat');
        $('#main-container').html('');
    },
    closeIfOpened:function(roomId){

        if(this.currentRoomId == roomId)
            this.close();

    }
    
}

module["exports"] = ChatManager;
