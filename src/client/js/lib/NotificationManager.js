var _ = require('lodash');

var Const = require('./consts');
var Config = require('./init');
var Utils = require('./utils');

var loginUserManager = require('./loginUserManager');
var soundManager = require('./SoundManager');
var EncryptionManager = require('./EncryptionManager');

var NotificationManager = {

    init: function(){
        
        if (!("Notification" in window)) {
            return;
        }

        if (Notification.permission === "granted") {

        }

        if (Notification.permission !== 'denied') {
            
            Notification.requestPermission(function (permission) {

                
            });
            
        }
  
	},
    handleNewMessage: function(obj){

        if(obj.muted){
            return;
        }

        if(obj.roomID == loginUserManager.currentConversation)
            return;
        
        var notificationKey = "";
        if(obj.group){
            notificationKey = obj.group._id;
        }else if(obj.room){
            notificationKey = obj.room._id;
        }else{
            notificationKey = obj.user._id;
        }
        
        var muteStatus = this.getNotificationStatus(notificationKey);
        
        if(notificationKey != "" && muteStatus == 0)
            return;
            
        var roomIDSplited = obj.roomID.split('-');
        
        // decrypt message if text message
        if(obj.type == 1){ // text message
            obj.message = EncryptionManager.decryptText(obj.message);
        }

        if(obj.group){
  
            var avatar = "/api/v2/avatar/group/";

            if(obj.group.avatar)
                avatar = "/api/v2/avatar/group/" + obj.group.avatar.thumbnail.nameOnServer;
                
            NotificationManager.showNotification(
                obj.group.name,
                obj.user.name + ":" + obj.message,
                avatar);
            
        }
        
        else if(obj.room){
            
            var avatar = "/api/v2/avatar/room/";

            if(obj.room.avatar)
                avatar = "/api/v2/avatar/room/" + obj.room.avatar.thumbnail.nameOnServer;
                
            NotificationManager.showNotification(
                obj.room.name,
                obj.user.name + ":" + obj.message,
                avatar);
            
        }
        
        else{

            
            var avatar = "/api/v2/avatar/user/";

            if(obj.user.avatar)
                avatar = "/api/v2/avatar/user/" + obj.user.avatar.thumbnail.nameOnServer;
            
            NotificationManager.showNotification(
                obj.user.name + Utils.l10n(' sent message. '),
                obj.message,
                avatar);

        }
              
    },
    showNotification: function(title,body,image){

        soundManager.notification();
        
        if (Notification.permission === "granted") {

            var options = {
                body: body,
                icon: image
            }
            
            var n = new Notification(title,options);
            
            _.debounce(function(){
                
                n.close();
                
            },2000)();
            
        }
        
    },
    setNotificationStatus: function(channel,state){
        
        if(state)
            state = 1;
        else
            state = 0;
            
        localStorage.setItem(Const.LocalStorageKeyNotification + channel,state);
        
    },
    getNotificationStatus: function(channel){
        
        var status = localStorage.getItem(Const.LocalStorageKeyNotification + channel);
        
        if(!status)
            return true;
        else{
            if(status == 1)
                return true;
            else
                return false;
        }
        
    }
   
}

module["exports"] = NotificationManager;

