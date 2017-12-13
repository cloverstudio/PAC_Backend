import socket from 'socket.io-client';

import * as constant from './const';
import * as config from './config';
import * as util from './utils';

import * as actions from '../actions';
import * as types from '../actions/types';
import * as strings from '../lib/strings';
import user from './user';

import Encryption from "./encryption/encryption";
import {store} from '../index';
import {chat} from '../actions'; 

class SocketManager {

    constructor(){

        this.processId = util.getRandomString(16);

        this.io = socket;
        
        this.ioNsp = this.io(config.socketUrl, {
            transports: ['websocket'], 
            upgrade: false
        });

        this.ioNsp.on('connect',function(){
        
        });
        
        this.ioNsp.on('reconnect',function(){

        });
        
        this.ioNsp.on('socketerror', function(error){
            
        });

        this.ioNsp.on('typing', function(obj){
            if(store.getState().chat.chatId === obj.roomID){
                if (obj.type === 1){
                    store.dispatch(actions.chat.startedTyping(obj.userID, obj.userName));
                }
                else {
                    store.dispatch(actions.chat.stoppedTyping(obj.userID));
                }
            }
        });

        this.ioNsp.on('newmessage', function(obj){

            if (store.getState().chat.chatId === obj.roomID){
                this.emit('openMessage', {
                    messageID: obj._id,
                    userID: user.userData._id
                })
            }

            console.log('ssss');
            store.dispatch(actions.chat.receiveMessage(obj));

        });
            
        this.ioNsp.on('updatemessages', function(ary){

        });

        this.ioNsp.on('spikaping', function(obj){

        });
        
        this.ioNsp.on('call_failed', function(obj){

            const failedType = obj.failedType;

            let message = "";

            if(failedType == constant.CallFailedUserOffline){
                message = strings.CallOutgoingFailedByOffile[user.lang];
            }

            else if(failedType == constant.CallFailedUserBusy){
                message = strings.CallOutgoingFailedByUserBusy[user.lang];
            }

            else if(failedType == constant.CallFailedUserReject){
                message = strings.CallOutgoingFailedByReject[user.lang];
            }

            else if(failedType == constant.CallFailedUserNotSupport){
                message = strings.CallOutgoingFailedByNotSupport[user.lang];
            }
            
            else {
                message = strings.CallOutgoingFailedUnknown[user.lang];
            }
            
            store.dispatch(actions.call.outgoingCallFailed(message));

        });

        this.ioNsp.on('call_request', function(obj){

            store.dispatch(actions.call.incomingCall(obj));

        });

        this.ioNsp.on('call_received', function(){
                
            store.dispatch(actions.call.outgoingCallStatusChanged(strings.CallOutgoingStatusRinging[user.lang]));

        });
        
        this.ioNsp.on('call_cancel', function(){

            store.dispatch(actions.call.incomingCallClose());

        });

        this.ioNsp.on('call_reject_mine', function(){

        });

        this.ioNsp.on('call_answer', function(){

            store.dispatch(actions.call.outgoingCallAnswered());

        });
        
        this.ioNsp.on('call_close', function(){

            store.dispatch(actions.call.callClose());
            
        });

        this.ioNsp.on('new_room', function(param){

        });

        this.ioNsp.on('delete_room', function(param){

        });

        this.ioNsp.on('delete_group', function(param){

        });
        
    }

    actionListener = store => next => action => {

        const currentState = store.getState();
        
        if (action.type === types.ChatSendMessage){

            this.emit('sendMessage', action.message);
            
        }

        if (action.type === types.ChatSendMessageInBg){
            this.emit('sendMessage', action.message)
        }
        
        if(action.type === types.ChatSendStartTyping){

            this.emit('sendtyping', {
                roomID: action.chatId,
                type:1,
                userID: user.userData._id,
                userName: user.userData.name
            });

        }

        if(action.type === types.ChatSendStopTyping){
            this.emit('sendtyping', {
                roomID: action.chatId,
                type:0,
                userID: user.userData._id
            });

        }

        if (action.type === types.CallIncomingMediaReady) {
            const user = store.getState().call.incomingCallUser;

            if(user){
                this.emit('call_received',{
                    userId : user._id,
                });
            }
        }

        if (action.type === types.CallIncomingMediaFailed) {
            const user = store.getState().call.incomingCallUser;

            if(user){
                this.emit('call_reject',{
                    userId : user._id,
                    rejectType : constant.CallFailedUserNotSupport
                });
            }
        }

        if (action.type === types.CallIncomingReject) {
            const user = store.getState().call.incomingCallUser;

            if(user){
                this.emit('call_reject',{
                    userId : user._id,
                    rejectType : constant.CallFailedUserReject
                });
            }
        }
        
        if (action.type === types.CallOutgoingConnect) {
            const user = action.call.user;

            if(user){
                this.emit('call_request',{
                    userId : user._id,
                    mediaType : action.call.mediaType
                });
            }
        }
    
        if (action.type === types.CallOutgoingClose) {
            const user = store.getState().call.outgoingCallUser;
            if(user){
                this.emit('call_cancel',{
                    userId : user._id,
                });
            }
        }

        if (action.type === types.CallFinish) {
            let user = store.getState().call.incomingCallUser;
            if(!user)
                user = store.getState().call.outgoingCallUser;

            if(user){
                this.emit('call_close',{
                    userId : user._id,
                });
            }
        }

        if (action.type === types.CallIncomingAccept) {
            const user = store.getState().call.incomingCallUser;
            if(user){
                this.emit('call_answer',{
                    userId : user._id,
                });
            }
        }

        next(action);

    }

    join(){

        if(user.token){

            this.emit('login',{
                token : user.token,
                processId : this.processId
            });

        }
    }

    emit(command, params){

        var command = arguments[0];
        this.ioNsp.emit(command, params);
        
    }

    disconnect(){

        if(!this.ioNsp.disconnected)
            this.ioNsp.disconnect();

    }

}

export default new SocketManager();


/*






var socket = require('socket.io-client');
var Backbone = require('backbone');
var _ = require('lodash');

var Const = require('./consts');
var Config = require('./init');
var Utils = require('./utils');

var loginUserManager = require('./loginUserManager');
var NotificationManager = require('./NotificationManager');

var socketIOManager = {
    
    io : null,
    processId: null,
    init:function(){
        
        var self = this;
                
        this.processId = Utils.getRandomString(16);
        
        this.io = socket;
        
        this.ioNsp = this.io(Config.socketUrl, {
            transports: ['websocket'], 
            upgrade: false
        });

        this.ioNsp.on('connect',function(){

	        var userToken = loginUserManager.getToken();
	
	        if(userToken){
	
	            self.emit('login',{
	                token : userToken,
	                processId : self.processId
	            });
	
	        }
        
        });
        
        this.ioNsp.on('reconnect',function(){

	        
        });
        
        this.ioNsp.on('socketerror', function(error){
            
            if(Const.ErrorCodes[error.code]){
                var alertDialog = require('../Views/Modals/AlertDialog/AlertDialog');
                var message = Utils.l10n(Const.ErrorCodes[error.code]);
                alertDialog.show(Utils.l10n("Api Error"),message);
            }
            
        });

        this.ioNsp.on('typing', function(obj){
            
            Backbone.trigger(Const.NotificationTyping,obj);
            
        });

        this.ioNsp.on('newmessage', function(obj){
            
            // History is refreshed by ChatView when the chat is opened
            if(loginUserManager.currentConversation != obj.roomID)
                Backbone.trigger(Const.NotificationRefreshHistory);
            else{
                Backbone.trigger(Const.NotificationRefreshHistoryLocally,obj);
            }

            Backbone.trigger(Const.NotificationNewMessage,obj);

            if(loginUserManager.user._id != obj.userID)
                NotificationManager.handleNewMessage(obj);
            
            
        });
            
        this.ioNsp.on('updatemessages', function(ary){
            
            Backbone.trigger(Const.NotificationMessageUpdated,ary);
            Backbone.trigger(Const.NotificationRefreshHistory);

        });

        this.ioNsp.on('spikaping', function(obj){

            self.emit('pingok',{
                userId : loginUserManager.getUser()._id,
                processId : self.processId 
            });

        });
        
        this.ioNsp.on('call_failed', function(obj){

            Backbone.trigger(Const.NotificationCallFaild,obj);

        });


        this.ioNsp.on('call_request', function(obj){

            Backbone.trigger(Const.NotificationCallRequest,obj);

        });
 
         this.ioNsp.on('call_received', function(){
			 
            Backbone.trigger(Const.NotificationCallReceived);

        });
        
        this.ioNsp.on('call_cancel', function(){

            Backbone.trigger(Const.NotificationCallCancel);

        });

        this.ioNsp.on('call_reject_mine', function(){

            Backbone.trigger(Const.NotificationCallRejectMine);

        });

        this.ioNsp.on('call_answer', function(){

            Backbone.trigger(Const.NotificationCallAnswer);

        });
        
        this.ioNsp.on('call_close', function(){

            Backbone.trigger(Const.NotificationCallClose);

        });
        

        this.ioNsp.on('new_room', function(param){

            Backbone.trigger(Const.NotificationNewRoom,param);

        });

        this.ioNsp.on('delete_room', function(param){

            Backbone.trigger(Const.NotificationRemoveRoom,param.conversation);

        });

        this.ioNsp.on('delete_group', function(param){

            Backbone.trigger(Const.NotificationDeletedFromGroup,param);

        });

    },
    
    emit:function(command,params){

        var command = arguments[0];
        this.ioNsp.emit(command, params);
        
    },

    disconnect: function(){

        //alert('send disconnect');

        if(!this.ioNsp.disconnected)
            this.ioNsp.disconnect();

    }
        
};

// Exports ----------------------------------------------
module["exports"] = socketIOManager;

*/