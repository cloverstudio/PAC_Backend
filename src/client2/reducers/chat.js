import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';

import user from '../lib/user';
import * as constant from '../lib/const';
import * as types from '../actions/types';

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
    isTyping: false,
    currentChatUser: null

}

const chatId = ( state = initial.chatId, action ) => {

    switch (action.type) {
        case types.ChatOpenByUser:
            return action.chatId;
         case types.ChatOpenByGroup:
            return action.chatId;
        case types.ChatOpenByRoom:
            return action.chatId;
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
        newState = oldState.concat(action.message)
    }

    if(action.type === types.ChatReceiveMessage){

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

    return newState;

}

const isTyping = (state = initial.isTyping, action) => {
    switch(action.type){
        case types.ChatOpenByUser:
            return false
        case types.ChatOpenByGroup:
            return false
        case types.ChatOpenByRoom:
            return false
        case types.ChatStartedTyping:
            return true
        case types.ChatStoppedTyping:
            return false
        default:
            return state
    }
}

export default combineReducers({
    chatAvatar,
    isLoading,
    messageList,
    chatId,
    chatType,
    isTyping,
    currentChatUser
});