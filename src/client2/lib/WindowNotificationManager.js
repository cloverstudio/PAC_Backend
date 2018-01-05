import Encryption from './encryption/encryption';
import { store } from '../index';
import user from './user';

import * as constant from './const';
import * as config from './config';
import notificationSound from '../assets/sounds/notification.mp3'

class WindowNotificationManager{

    constructor(){
        this.permission = null;
        this.visibility = null;

        this.askPermission();
        this.initVisibilityEventListeners();

        this.audioElement = new Audio(notificationSound);
    }

    askPermission = () => {
        if (this.permission) return;

        if (Notification.permission !== 'denied'){
            try{
                Notification.requestPermission()
                .then(permission => this.permission = permission)
            }
            catch(error){
                Notification.requestPermission(p => this.permission = p)
            }
            
        }
    }

    initVisibilityEventListeners = callback => {

        window.addEventListener('load', ()=>{ 
            
            let hidden, visibilityChange; 

            if (typeof document.hidden !== "undefined") {
                hidden = "hidden";
                visibilityChange = "visibilitychange";
            } else if (typeof document.msHidden !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange";
            } else if (typeof document.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange";
            }

            this.setVisibility(!window.document[hidden]);

            window.document.addEventListener(visibilityChange, () => {
                this.setVisibility(!window.document[hidden]);
            });

            window.addEventListener("focus", ()=> this.setVisibility(true));
            window.addEventListener("blur", ()=> this.setVisibility(false));
        });
        
    } 

    setVisibility = val => {
        this.visibility = val;

    }

    handleMessage = obj => {
        if (user.userData._id === obj.user._id) return;

        if (this.permission === 'granted' || Notification.permission === 'granted'){

            const chatIdSplit = obj.roomID.split("-");
            const chatType = parseInt(chatIdSplit[0]);

            const title = `${obj.user.name} sent:`
            let message;
            let avatar = config.APIEndpoint;
            
            switch(obj.type){
                case constant.MessageTypeText:
                    message = Encryption.decryptText(obj.message);
                    break;
                case constant.MessageTypeSticker:
                    message = 'Sticker';
                    break;
                case constant.MessageTypeFile:
                    message = 'File';
                    break;
                default:
                    message = 'message';
            }

            switch(chatType){
                case constant.ChatTypePrivate:
                    avatar += constant.ApiUrlGetUserAvatar;
                    if (obj.user.avatar && obj.user.avatar.thumbnail)
                        avatar += obj.user.avatar.thumbnail.nameOnServer;
                    else avatar += obj.user._id;
                    break;

                case constant.ChatTypeGroup:
                    avatar += constant.ApiUrlGetGroupAvatar;
                    if (obj.group.avatar && obj.group.avatar.thumbnail)
                        avatar += obj.group.avatar.thumbnail.nameOnServer;
                    else avatar += obj.group._id;
                    break;

                case constant.ChatTypeRoom:
                    avatar += constant.ApiUrlGetRoomAvatar;
                    if (obj.room.avatar && obj.room.avatar.thumbnail)
                        avatar += obj.room.avatar.thumbnail.nameOnServer;
                    else avatar += obj.room._id;
                    break; 
            }

            if ( !(this.visibility || store.getState().infoView.muted) ) this.showNotification(title, message, avatar);
            
        }

    }

    showNotification = (title, body, icon) => {

        const options = {
            body,
            icon
        };

        const notification = new Notification(title, options);
        this.audioElement.play();

        this.lastNotificationTimeout = setTimeout(
            () => notification.close(),
            constant.NotificationCloseTimeout);

    }

}

export default new WindowNotificationManager();
