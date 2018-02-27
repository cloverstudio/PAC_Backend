import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';
import { isError } from 'util';

import * as constant from '../lib/const';

const keyword = (state = "", action) => {
    switch (action.type) {
        case types.RoomInitEditingRoom:
            return "";
        case types.RoomStartCreatingRoom:
            return "";
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

const roomInfoLoading = (state = false, action) => {
    switch (action.type) {
        case types.RoomInitEditingRoom:
            return true;
        case types.RoomStartEditingRoom:
            return false;
        default:
            return state;
    }
}

const userSearchLoading = (state = false, action) => {
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
        case types.RoomInitEditingRoom:
            return [];
        case types.RoomStartCreatingRoom:
            return [];
        case types.RoomSearchUserSucceed:
            return action.data.list.filter((user) => {

                let isExists = false;

                action.members.forEach((selectedUser) => {

                    if (selectedUser._id == user._id)
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
        case types.RoomInitEditingRoom:
            return [];
        case types.RoomStartCreatingRoom:
            return [];
        case types.RoomAddMember:
            return state.find(user => user._id == action.user._id)
                ? state
                : state.concat(action.user);
        case types.RoomDeleteMember:
            return state.filter((user) => {
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
        case types.RoomInitEditingRoom:
            return action.data.name;
        case types.RoomStartCreatingRoom:
            return "";
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
        case types.RoomInitEditingRoom:
            return typeof action.data.description == 'undefined'
                ? ""
                : action.data.description;
        case types.RoomStartCreatingRoom:
            return "";
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
        case types.RoomInitEditingRoom:
            return null;
        case types.RoomStartCreatingRoom:
            return null;
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
        case types.RoomInitEditingRoom:
            return "";
        case types.RoomStartCreatingRoom:
            return "";
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

    switch (action.type) {
        case types.RoomInitEditingRoom:
            return action.data._id;
        case types.RoomStartEditingRoom:
            return action.room._id;
        case types.RoomStartCreatingRoom:
            return null;
        default:
            return state;
    }

}


const editingRoomData = (state = null, action) => {

    switch (action.type) {
        case types.RoomInitEditingRoom:
            return action.data;
        case types.RoomStartCreatingRoom:
            return null;
        case types.RoomStartEditingRoom:
            return action.room
        default:
            return state;
    }

}


export default combineReducers({
    userSearchLoading,
    roomInfoLoading,
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
