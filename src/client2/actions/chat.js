import { push } from 'react-router-redux'


import * as types from './types';
import * as actions from '../actions';

import {
    callGetMessageList,
    callGetUserDetail,
    callGetGroupDetail,
    callGetRoomDetail,
    fileUploadWrapper
} from '../lib/api/';

import * as strings from '../lib/strings';
import user from '../lib/user';
import * as utils from '../lib/utils';
import * as constant from '../lib/const';
import Encryption from "../lib/encryption/encryption";

import {store} from '../index';

export function loadNewChat(chatId){

    return (dispatch, getState) => {

        callGetMessageList(chatId,0,constant.ChatDirectionNew).then( (data) => {

            dispatch({
                type: types.ChatLoadMessageSucceed,
                messages: data.messages
            });

        }).catch( (err) => {

            console.error(err);

            dispatch(actions.notification.showToast(strings.FailedToLoatMessage[user.lang]));

            dispatch({
                type: types.ChatLoadMessageFailed
            });

        });

    }

}

export function clearChat(){
    return {
        type: types.ChatClearChat
    }
}

export function openChatByChatId(chatId){
    
    return (dispatch, getState) => {

        if(!chatId)
            return;

        const chatIdSplit = chatId.split('-');
        const chatType = chatIdSplit[0];

        if(chatType == constant.ChatTypePrivate){
          
            const user1 = chatIdSplit[1];
            const user2 = chatIdSplit[2];

            if(!user1 || !user2)
                return;
            
            let targetUser = user1;
            if(user1 == user.userData._id)
                targetUser = user2;

            callGetUserDetail(targetUser).then( (data) => {
                
                dispatch(openChatByUser(data.user));
                dispatch(loadNewChat(chatId));

            }).catch( (err) => {
                
                console.error(err);

                dispatch(actions.notification.showToast(strings.FailedToLoatMessage[user.lang]));
    
            });

        }

        if(chatType == constant.ChatTypeGroup){

            const groupId = chatIdSplit[1];

            if(!groupId)
                return;

            callGetGroupDetail(groupId).then( (data) => {
                
                dispatch(openChatByGroup(data.group));
                dispatch(loadNewChat(chatId));

            }).catch( (err) => {
                
                console.error(err);
                dispatch(actions.notification.showToast(strings.FailedToLoatMessage[user.lang]));
    
            });
        }

        if(chatType == constant.ChatTypeRoom){

            const roomId = chatIdSplit[1];

            if(!roomId)
                return;

            callGetRoomDetail(roomId).then( (data) => {
                
                dispatch(openChatByRoom(data.room));
                dispatch(loadNewChat(chatId));

            }).catch( (err) => {
                console.error(err);
                dispatch(actions.notification.showToast(strings.FailedToLoatMessage[user.lang]));
    
            });

        }
        
    };

}

export function openChatByUser(targetUser) {
    
    return (dispatch, getState) => {

        const chatId = utils.chatIdByUser(targetUser);

        store.dispatch(push(`${utils.url('/chat/' + chatId)}`));

        dispatch({
            type: types.ChatOpenByUser,
            user: targetUser,
            chatId
        });
        
    }

}

export function openChatByGroup(group) {

    return (dispatch, getState) => {
        
        const chatId = utils.chatIdByGroup(group);

        dispatch(push(`${utils.url('/chat/' + chatId)}`));

        dispatch({
            type: types.ChatOpenByGroup,
            group,
            chatId
        });

    }

}

export function openChatByRoom(room) {
    
    
    return (dispatch, getState) => {

        const chatId = utils.chatIdByRoom(room);

        dispatch(push(`${utils.url('/chat/' + chatId)}`));

        dispatch({
            type: types.ChatOpenByRoom,
            room,
            chatId
        });

    }

}

export function loadOldMessages(chatId, lastMessage){

    return (dispatch, getState) => {
        dispatch({
            type:types.ChatLoadOldMessagesStart
        })
        
        callGetMessageList(chatId,lastMessage, constant.ChatDirectionOld).then( (data) => {

            dispatch({
                type: types.ChatLoadOldMessagesSucceed,
                messages: data.messages
            });

        }).catch( (err) => {

            console.error(err);
            
            dispatch(actions.notification.showToast(strings.FailedToLoatMessage[user.lang]));

            dispatch({
                type: types.ChatLoadMessageFailed
            });

        });

    }
}

export function receiveMessage(message){

    const roomID = message.roomID;

    return (dispatch, getState) => {

        if(getState().chat.chatId == roomID){
            dispatch({
                type: types.ChatReceiveMessage,
                message,
                currentChat:true
            });
        }else{
            dispatch({
                type: types.ChatReceiveMessage,
                message,
                currentChat:false
            });
        }

        const historyList = getState().history.historyList;
        const chunks = message.roomID.split('-');
        let chatId = chunks[chunks.length - 1];
        let chatType = chunks[0];

        if(chatType == constant.ChatTypePrivate){
            chatId = utils.getTargetUserIdFromRoomId(message.roomID);
        }

        let isExists = false;

        historyList.forEach( (history) => {
            if(history.chatId == chatId)
                isExists = true;
        });

        if(!isExists){
            // check history and if didn't exist refresh all history
            dispatch(actions.history.loadHistoryInitial());
        }
        
    };

}

export function sendMessage(messageType, content, localID = utils.getRandomString()){

    return (dispatch, getState) => {
        
        const message = {
            roomID: getState().chat.chatId, 
            userID: user.userData._id,
            type: messageType,
            localID,
            attributes: {"useclient":"web"},
            user: user.userData
        }
    
        //message / file field
        switch(messageType){
            case constant.MessageTypeText:
                message.message = Encryption.encryptText(content);
                break;
            case constant.MessageTypeFile:
                message.file = content;
                break;
            case constant.MessageTypeSticker:
                message.message = content;
                break;
            default:
                return false;
        }
    
        //add created field
        message.created = new Date().getTime();
        
        dispatch({
            type: types.ChatSendMessage, 
            messageType,
            content,
            message
        });

    }
}

export function sendMessageInBg(messageType, content, localID, roomID){
    return (dispatch, getState) => {
        
        const message = {
            roomID,
            userID: user.userData._id,
            type: messageType,
            localID,
            attributes: {"useclient":"web"},
            user: user.userData
        };

        switch(messageType){
            case constant.MessageTypeFile:
                message.file = content;
                break;
            default:
                return false;
        }
        
        dispatch({
            type: types.ChatSendMessageInBg,
            message
        })
    }
}

export function startedTyping(userID, userName){
    return {
        type: types.ChatStartedTyping,
        userID,
        userName
    }
}

export function stoppedTyping(userID){
    return {
        type: types.ChatStoppedTyping,
        userID
    }
}

export function sendStartTyping(chatId){
    return {
        type: types.ChatSendStartTyping,
        chatId
    }
}

export function sendStopTyping(chatId){
    return {
        type: types.ChatSendStopTyping,
        chatId
    }
}

export function changeInputValue(chatId, value){
    return {
        type: types.ChatChangeInputValue,
        chatId,
        value
    }
}

export function fileUploadProgress(progress, localFileId, chatId){
    return {
        type: types.ChatFileUploadProgress,
        progress,
        chatId,
        localFileId
    }
}

export function fileUploadSucceed(localFileId, chatId){
    return {
        type: types.ChatFileUploadSucceed,
        chatId,
        localFileId
    }
}

export function startFileUpload(file){

    return (dispatch, getState) => {

        const localFileId = utils.getRandomString();        
        const originChatId = getState().chat.chatId;
        const fileUpload = fileUploadWrapper(localFileId, originChatId);

        dispatch({
            type: types.ChatStartFileUpload,
            chatId:originChatId,
            localFileId
        });
        
        fileUpload(file, function(progress, localFileId, originChatId){
            dispatch(fileUploadProgress(progress, localFileId, originChatId));
        })
        .then( data => {

            dispatch(fileUploadSucceed(localFileId, originChatId));

            const currentChatId = getState().chat.chatId;

            if (originChatId === currentChatId){
                dispatch(sendMessage(constant.MessageTypeFile, data, localFileId));                 
            }
            
            else{
                dispatch(sendMessageInBg(constant.MessageTypeFile, data, localFileId, originChatId));
            }
        })
        .catch( err => {
            //todo: handle err
            console.log(err);
        })

    }
}