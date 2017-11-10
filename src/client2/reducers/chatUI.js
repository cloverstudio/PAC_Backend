import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';

const notificationState = (state = false, action) => {
    switch (action.type) {
        case types.ChatShowNotification:
            return true;
        case types.ChatHideNotification:
            return false;
        default:
            return state;
    }
};


const usersViewState = (state = false, action) => {
    switch (action.type) {
        case types.ChatShowUsersView:
            return true;
        case types.ChatHideUsersView:
            return false;
        default:
            return state;
    }
};


const groupsViewState = (state = false, action) => {
    switch (action.type) {
        case types.ChatShowGroupsView:
            return true;
        case types.ChatHideGroupsView:
            return false;
        default:
            return state;
    }
};

const userInfoTabState = (state = "options", action) => {
    switch (action.type) {
        case types.UserInfoTabChange:
            return action.tabName;
        default:
            return state;
    }
};


const groupInfoTabState = (state = "options", action) => {
    switch (action.type) {
        case types.GroupInfoTabChange:
            return action.tabName;
        default:
            return state;
    }
};

const roomInfoTabState = (state = "options", action) => {
    switch (action.type) {
        case types.RoomInfoTabChange:
            return action.tabName;
        default:
            return state;
    }
};

export default combineReducers({
    notificationState,
    usersViewState,
    groupsViewState,
    userInfoTabState,
    groupInfoTabState,
    roomInfoTabState
});;
