import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';

import * as constant from '../lib/const';
import * as types from '../actions/types';

const initial = {
    chatAvatar: {
        type: null,
        fileId: null,
        name: null
    },
    isLoading: false,
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
        default:
            return state;
    }
}

export default combineReducers({
    chatAvatar,
    isLoading
});