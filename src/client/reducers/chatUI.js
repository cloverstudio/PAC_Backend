import { routerReducer as routing } from "react-router-redux";
import { combineReducers } from "redux";
import * as types from "../actions/types";

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

const stickersViewState = (state = false, action) => {
    switch (action.type) {
        case types.ChatShowStickersView:
            return true;
        case types.ChatHideStickersView:
            return false;
        default:
            return state;
    }
};

const sidebarState = (state = false, action) => {
    switch (action.type) {
        case types.ChatShowSidebar:
            return true;
        case types.ChatHideSidebar:
            return false;
        case types.ChatShowHistory:
            return false;
        case types.ChatHideHistory:
            return false;
        case types.HistoryMarkAllStart:
            return false;
        default:
            return state;
    }
};

const historyBarState = (state = false, action) => {
    switch (action.type) {
        case types.ChatShowHistory:
            return true;
        case types.ChatHideHistory:
            return false;
        default:
            return state;
    }
};

const infoViewState = (state = false, action) => {
    switch (action.type) {
        case types.ChatShowInfoView:
            return true;
        case types.ChatHideInfoView:
            return false;
        default:
            return state;
    }
};

const imageViewState = (state = false, action) => {
    switch (action.type) {
        case types.ChatShowImageView:
            return true;
        case types.ChatHideImageView:
            return false;
        default:
            return state;
    }
};

const messageInfoViewState = (state = false, action) => {
    switch (action.type) {
        case types.ChatHideMessageInfoView:
            return false;
        case types.ChatShowMessageInfoView:
            return true;
        default:
            return state;
    }
};

const messageForwardViewState = (state = false, action) => {
    switch (action.type) {
        case types.ChatHideMessageForwardView:
            return false;
        case types.ChatShowMessageForwardView:
            return true;
        default:
            return state;
    }
};

const messageUpdateViewState = (state = false, action) => {
    switch (action.type) {
        case types.ChatHideMessageUpdateView:
            return false;
        case types.ChatShowMessageUpdateView:
            return true;
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
    roomInfoTabState,
    stickersViewState,
    sidebarState,
    historyBarState,
    infoViewState,
    imageViewState,
    messageInfoViewState,
    messageForwardViewState,
    messageUpdateViewState
});
