import socket from 'socket.io-client';

import * as constant from './const';
import * as config from './config';
import * as util from './utils';

import user from './user';

import * as actions from '../actions';
import * as types from '../actions/types';


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
            if(store.getState().chat.chatId === obj.roomID && 
                obj.userID != user.userData._id){
                if (obj.type === 1){
                    store.dispatch(actions.chat.startedTyping());
                }
                else {
                    store.dispatch(actions.chat.stoppedTyping());
                }
            }
        });

        this.ioNsp.on('newmessage', function(obj){
            if (store.getState().chat.chatId === obj.roomID){
                
                store.dispatch(actions.chat.receiveMessage(obj));

                this.emit('openMessage', {
                    messageID: obj._id,
                    userID: user.userData._id
                })
            }
        });
            
        this.ioNsp.on('updatemessages', function(ary){

        });

        this.ioNsp.on('spikaping', function(obj){

        });
        
        this.ioNsp.on('call_failed', function(obj){

        });

        this.ioNsp.on('call_request', function(obj){

            store.dispatch(actions.call.incomingCall(obj));

        });

        this.ioNsp.on('call_received', function(){
                


        });
        
        this.ioNsp.on('call_cancel', function(){

            store.dispatch(actions.call.incomingCallClose());

        });

        this.ioNsp.on('call_reject_mine', function(){

        });

        this.ioNsp.on('call_answer', function(){

        });
        
        this.ioNsp.on('call_close', function(){

        });

        this.ioNsp.on('new_room', function(param){

        });

        this.ioNsp.on('delete_room', function(param){

        });

        this.ioNsp.on('delete_group', function(param){

        });
        
    }

    actionListener = store => next => action => {

        //construct msg
        if (action.type === types.ChatSendMessage){

            const currentState = store.getState();
            
            //common fields
            action.message = {
                roomID: currentState.chat.chatId, 
                userID: user.userData._id,
                type: action.messageType,
                localID: util.getRandomString(),
                attributes: {"useclient":"web"}
            }
            
            //user
            if (action.messageType === constant.MessageTypeText || action.messageType === constant.MessageTypeFile){
                action.message.user = user.userData
            }

            //message / file field
            switch(action.messageType){
                case constant.MessageTypeText:
                    action.message.message = Encryption.encryptText(action.content);
                    break;
                case constant.messageTypeFile:
                    action.message.file = action.content;
                    break;
                case constant.messageTypeSticker:
                    action.message.message = action.content;
                    break;
                default:
                    return false;
            }

            this.emit('sendMessage', action.message);
            //add created field
            action.message.created = new Date().getTime();

        }

        if (action.type === types.CallIncomingReject) {

            const user = store.getState().call.incomingcallUser;
            if(user){
                this.emit('call_reject',{
                    userId : user._id,
                    rejectType : constant.CallFailedUserReject
                    
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