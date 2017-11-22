import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';
import { isError } from 'util';


const keyword = (state = "", action) => {
    switch (action.type) {
        case types.CreateRoomTypeKeyword:
            return action.keyword;
        case types.CreateRoomAddMember:
            return "";
        case types.CreateRoomSaveSucceed:
            return "";
        default:
            return state;
    }
};

const loading = (state = false, action) => {
    switch (action.type) {
        case types.CreateRoomSearchUserStart:
            return true;
        case types.CreateRoomSearchUserSucceed:
            return false;
        case types.CreateRoomSearchUserFailed:
            return false;
        default:
            return state;
    }
};

const searchResult = (state = [], action) => {
    switch (action.type) {
        case types.CreateRoomSearchUserSucceed:
            return action.data.list.filter( (user) => {

                let isExists = false;

                action.members.forEach( (selectedUser) => {

                    if(selectedUser._id == user._id)
                        isExists = true;

                });

                return !isExists;

            });
        case types.CreateRoomSearchUserStart:
            return [];
        default:
            return state;
    }
}

const members = (state = [], action) => {
    switch (action.type) {
        case types.CreateRoomAddMember:
            return state.concat( action.user );
        case types.CreateRoomDeleteMember:
            return state.filter ( (user) => {
                return action.user._id != user._id
            });
        case types.CreateRoomCancel:
            return []
        case types.CreateRoomSaveSucceed:
            return [];
        default:
            return state;
    }
}


const name = (state = "", action) => {
    switch (action.type) {
        case types.CreateRoomTypeName:
            return action.name
        case types.CreateRoomSaveSucceed:
            return "";
        default:
            return state;
    }
}

const description = (state = "", action) => {
    switch (action.type) {
        case types.CreateRoomTypeDescription:
            return action.description;
        case types.CreateRoomSaveSucceed:
            return "";
        default:
            return state;
    }
}

const avatarImage = (state = null, action) => {
    switch (action.type) {
        case types.CreateRoomSelectFile:
            return action.file
        case types.CreateRoomDeleteFile:
            return null;
        case types.CreateRoomSaveSucceed:
            return null;

        default:
            return state;
    }
}

const avatarImageUrl = (state = "", action) => {
    switch (action.type) {
        case types.CreateRoomSelectFile:
            return action.fileUrl  
        case types.CreateRoomDeleteFile:
            return "";
        default:
            return state;
    }
}

const saving = (state = false, action) => {
    switch (action.type) {
        case types.CreateRoomSaveStart:
            return true
        case types.CreateRoomSaveSucceed:
            return false
        case types.CreateRoomSaveFailed:
            return false
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
    saving
});;
