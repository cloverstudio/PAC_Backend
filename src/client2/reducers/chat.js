import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';

import user from '../lib/user';
import * as constant from '../lib/const';
import * as types from '../actions/types';
import * as utils from '../lib/utils';

const initial = {
    chatAvatar: {
        type: null,
        fileId: null,
        name: null
    },
    isLoading: false,
    messageList: [],
    chatId: "",
    chatType: constant.ChatTypePrivate,
    typing: {},
    timestampByChat: 0,
    inputValues: {}
}

const timestampByChat = ( state = initial.timestampByChat, action ) => {

    switch (action.type) {
        case types.ChatOpenByUser:
            return (new Date()).getTime();
        case types.ChatOpenByGroup:
            return (new Date()).getTime();
        case types.ChatOpenByRoom:
            return (new Date()).getTime();
        default:
            return state;
    }

}

const chatId = ( state = initial.chatId, action ) => {

    switch (action.type) {
        case types.ChatOpenByUser:
            return action.chatId;
         case types.ChatOpenByGroup:
            return action.chatId;
        case types.ChatOpenByRoom:
            return action.chatId;
        case types.ChatClearChat:
            return ""
        default:
            return state;
    }

}

const chatType = ( state = initial.chatType, action ) => {

    switch (action.type) {
        case types.ChatOpenByUser:
            return constant.ChatTypePrivate;
        case types.ChatOpenByGroup:
            return constant.ChatTypeGroup;
        case types.ChatOpenByRoom:
            return constant.ChatTypeRoom;
        case types.ChatClearChat:
            return initial.chatType;

        default:
            return state;
    }

}

const currentChatUser = ( state = initial.currentChatUser, action ) => {
    
    switch (action.type) {
        case types.ChatOpenByUser:
            return action.user;
        case types.ChatOpenByGroup:
            return null;
        case types.ChatOpenByRoom:
            return null;
        case types.ChatClearChat:
            return null;

        default:
            return state;
    }

}

const chatAvatar = (state = initial.chatAvatar, action) => {

    const oldState = state;
    const newState = oldState;

    if(action.type == types.ChatOpenByUser){

        const user = action.user;

        newState.type = constant.AvatarUser;
        newState.fileId = "";

        if(user && user.avatar && user.avatar.thumbnail)
            newState.fileId = user.avatar.thumbnail.nameOnServer;
    
        newState.name = user.name;

    }

    else if(action.type == types.ChatOpenByGroup){

        const group = action.group;

        newState.type = constant.AvatarGroup;
        newState.fileId = "";

        if(group && group.avatar && group.avatar.thumbnail)
            newState.fileId = group.avatar.thumbnail.nameOnServer;
        
        newState.name = group.name;

    }

    else if(action.type == types.ChatOpenByRoom){

        const room = action.room;

        newState.type = constant.AvatarRoom;
        newState.fileId = "";

        if(room && room.avatar && room.avatar.thumbnail)
            newState.fileId = room.avatar.thumbnail.nameOnServer;
    
        newState.name = room.name;

    }

    if(action.type == types.ChatClearChat)
        return initial.chatAvatar;

    return Object.assign({}, newState);

};

const isLoading = (state = initial.isLoading, action) => {
    
    switch (action.type) {
        case types.ChatOpenByUser:
            return true;
         case types.ChatOpenByGroup:
            return true;
        case types.ChatOpenByRoom:
            return true;
        case types.ChatLoadMessageSucceed:
            return false;
        case types.ChatLoadMessageFailed:
            return false;
        case types.ChatLoadOldMessagesStart:
            return true;
        case types.ChatLoadOldMessagesSucceed:
            return false;
        default:
            return state;
    }
}

const messageList = (state = initial.messageList, action) => {
    
    const oldState = state;
    let newState = oldState;

    if(action.type == types.ChatOpenByUser
        || action.type == types.ChatOpenByGroup
        || action.type == types.ChatOpenByRoom){

            newState = [];
    }

    if(action.type == types.ChatLoadMessageSucceed){
            newState = action.messages;
    }

    if(action.type === types.ChatLoadOldMessagesSucceed){
        newState = action.messages.reverse().concat(oldState) 
    }

    if(action.type === types.ChatSendMessage){
        newState = oldState.concat(action.message);
    }

    if(action.type === types.ChatReceiveMessage){

        if(!action.currentChat)
            return state;
            
        if (action.message.userID === user.userData._id){
            let myMessageIndex = oldState.findIndex(message => message.localID === action.message.localID)
    
            if (myMessageIndex > -1){
                return oldState.map((msg, i) => {
                    if (i === myMessageIndex) {
                        return action.message
                    }
                    else return msg
                })
            }
        }

        else {
            newState = oldState.concat(action.message)
        }
    }

    if(action.type === types.ChatStartFileUpload){

        newState = oldState.concat({
            localID: action.localFileId,
            userID: action.userID,
            created: action.created,
            type: action.MsgType
        })
    }

    if(action.type === types.ChatFileUploadSucceed){
        
            let myMessageIndex = -1;
            for (let i = oldState.length-1; i>-1; i--){
                if (oldState[i].localID === action.localFileId){
                    myMessageIndex = i;
                    break;
                }
            }
            if (myMessageIndex > -1){
               newState = oldState.filter((msg, i) => i !== myMessageIndex); 
            }    
    }

    if(action.type == types.ChatClearChat)
        return initial.messageList

    if(action.type === types.MessageInfoDeleteMessage){
        
            let myMessageIndex = oldState.findIndex(message => action.messageID === message._id)

            if (myMessageIndex > -1){
                return oldState.map((msg, i) => {
                    if (i === myMessageIndex && typeof msg.deleted === 'undefined') {
                        let deleted = {...msg}
                        deleted.message='';
                        deleted.deleted = new Date().getTime();                        
                        return deleted
                    }
                    return msg
                })
            }
    }

    // if(action.type === types.MessageInfoUpdateMessageSucceed){

    //     let myMessageIndex = oldState.findIndex(message => action.messageID === message._id)

    //     if (myMessageIndex > -1){
    //         return oldState.map((msg, i) => {
    //             if (i === myMessageIndex) {
    //                 msg.message= Encry;
    //             }
    //             return msg
    //         })
    //     }

    // }

    return newState;

}

const typing = (state = initial.typing, action) => {
    switch(action.type){
        case types.ChatOpenByUser:
            return {};
        case types.ChatOpenByGroup:
            return {};            
        case types.ChatOpenByRoom:
            return {};            
        case types.ChatStartedTyping:
            return {...state, [action.userID]:action.userName};
        case types.ChatStoppedTyping:
            const newState = {...state};
            delete newState[action.userID];
            return newState;
        default:
            return state;
    }
}

const inputValues = ( state = initial.inputValues, action ) => {
    switch(action.type){
        case types.ChatChangeInputValue:
            const newState = {...state};
            newState[action.chatId] = action.value;
            return newState;
        default:
            return state;
    }
}

export default combineReducers({
    chatAvatar,
    isLoading,
    messageList,
    chatId,
    chatType,
    typing,
    timestampByChat,
    inputValues
});