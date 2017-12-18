import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';
import { isError } from 'util';

import * as constant from '../lib/const';

const keyword = (state = "", action) => {
    switch (action.type) {
        case types.RoomTypeKeyword:
            return action.keyword;
        case types.RoomAddMember:
            return "";
        case types.RoomSaveSucceed:
            return "";
        default:
            return state;
    }
};

const loading = (state = false, action) => {
    switch (action.type) {
        case types.RoomSearchUserStart:
            return true;
        case types.RoomSearchUserSucceed:
            return false;
        case types.RoomSearchUserFailed:
            return false;
        default:
            return state;
    }
};

const searchResult = (state = [], action) => {
    switch (action.type) {
        case types.RoomSearchUserSucceed:
            return action.data.list.filter( (user) => {

                let isExists = false;

                action.members.forEach( (selectedUser) => {

                    if(selectedUser._id == user._id)
                        isExists = true;

                });

                return !isExists;

            });
        case types.RoomSearchUserStart:
            return [];
        default:
            return state;
    }
}

const members = (state = [], action) => {
    switch (action.type) {
        case types.RoomAddMember:
            return state.concat( action.user );
        case types.RoomDeleteMember:
            return state.filter ( (user) => {
                return action.user._id != user._id
            });
        case types.RoomCancel:
            return []
        case types.RoomSaveSucceed:
            return [];
        default:
            return state;
    }
}


const name = (state = "", action) => {
    switch (action.type) {
        case types.RoomTypeName:
            return action.name
        case types.RoomSaveSucceed:
            return "";
        default:
            return state;
    }
}

const description = (state = "", action) => {
    switch (action.type) {
        case types.RoomTypeDescription:
            return action.description;
        case types.RoomSaveSucceed:
            return "";
        default:
            return state;
    }
}

const avatarImage = (state = null, action) => {
    switch (action.type) {
        case types.RoomSelectFile:
            return action.file
        case types.RoomDeleteFile:
            return null;
        case types.RoomSelectFileByURL:
            return {};
        case types.RoomSaveSucceed:
            return null;

        default:
            return state;
    }
}

const avatarImageUrl = (state = "", action) => {
    switch (action.type) {
        case types.RoomSelectFile:
            return action.fileUrl;
        case types.RoomSelectFileByURL:
            return action.url;
        case types.RoomDeleteFile:
            return "";
        default:
            return state;
    }
}

const saving = (state = false, action) => {
    switch (action.type) {
        case types.RoomSaveStart:
            return true
        case types.RoomSaveSucceed:
            return false
        case types.RoomSaveFailed:
            return false
        default:
            return state;
    }
}

const editingRoomId = (state = null, action) => {

    if(!action.payload)
        return state;

    const path = action.payload.pathname;

    if(/editroom/.test(path)){
    
        const chanks = path.split('/');
    
        const roomId = chanks[chanks.length - 1];
    
        return roomId;

    }
    
    if(/newroom/.test(path)){
        return null;
    }


    return state;

}


const editingRoomData = (state = null, action) => {

    switch (action.type) {
        case types.RoomStartEditingRoom:
            return action.room
        default:
            return state;
    }

}


export default combineReducers({
    loading,
    searchResult,
    keyword,
    members,
    name,
    description,
    avatarImage,
    avatarImageUrl,
    saving,
    editingRoomId,
    editingRoomData
});;
