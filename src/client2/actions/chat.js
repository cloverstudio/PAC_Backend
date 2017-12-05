import { push } from 'react-router-redux'


import * as types from './types';
import * as actions from '../actions';

import {
    callGetMessageList,
    callGetUserDetail,
    callGetGroupDetail,
    callGetRoomDetail,
} from '../lib/api/';

import * as strings from '../lib/strings';
import user from '../lib/user';
import * as utils from '../lib/utils';
import * as constant from '../lib/const';

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
    return{
        type: types.ChatReceiveMessage,
        message
    }
}

export function sendMessage(messageType, content){

    return (dispatch, getState) => {

        const message = {
            roomID: getState().chat.chatId, 
            userID: user.userData._id,
            type: messageType,
            localID: utils.getRandomString(),
            attributes: {"useclient":"web"},
            user: user.userData
        }
        
        dispatch({
            type: types.ChatSendMessage, 
            messageType,
            content,
            message
        });

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

export function sendStartTyping(){
    return {
        type: types.ChatSendStartTyping
    }
}

export function sendStopTyping(){
    return {
        type: types.ChatSendStopTyping
    }
}
