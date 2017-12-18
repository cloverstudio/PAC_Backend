import * as types from "./types";
import * as actions from "../actions";
import { login } from "../lib/api/";
import { globalStore } from "../index";

export function showNotification() {
    return {
        type: types.ChatShowNotification
    };
}

export function hideNotification() {
    return {
        type: types.ChatHideNotification
    };
}

export function showUsersView() {
    return {
        type: types.ChatShowUsersView
    };
}

export function hideUsersView() {
    return {
        type: types.ChatHideUsersView
    };
}

export function showGroupsView() {
    return {
        type: types.ChatShowGroupsView
    };
}

export function hideGroupsView() {
    return {
        type: types.ChatHideGroupsView
    };
}

export function tabChangedUserInfo(tabName) {
    return {
        type: types.UserInfoTabChange,
        tabName
    };
}

export function tabChangedGroupInfo(tabName) {
    return {
        type: types.GroupInfoTabChange,
        tabName
    };
}

export function tabChangedRoomInfo(tabName) {
    return {
        type: types.RoomInfoTabChange,
        tabName
    };
}

export function hideStickersView() {
    return {
        type: types.ChatHideStickersView
    };
}

export function showStickersView() {
    return {
        type: types.ChatShowStickersView
    };
}

export function showSidebar() {
    return {
        type: types.ChatShowSidebar
    };
}

export function hideSidebar() {
    return {
        type: types.ChatHideSidebar
    };
}

export function showHistory() {
    return {
        type: types.ChatShowHistory
    };
}

export function hideHistory() {
    return {
        type: types.ChatHideHistory
    };
}

export function showInfoView() {
    return {
        type: types.ChatShowInfoView
    };
}

export function hideInfoView() {
    return {
        type: types.ChatHideInfoView
    };
}

export function showImageView(imgId) {
    return {
        type: types.ChatShowImageView,
        imgId
    };
}

export function hideImageView() {
    return {
        type: types.ChatHideImageView
    };
}

export function showMessageInfoView() {
    return {
        type: types.ChatShowMessageInfoView
    };
}

export function hideMessageInfoView() {
    return {
        type: types.ChatHideMessageInfoView
    };
}

export function showMessageForwardView() {
    return {
        type: types.ChatShowMessageForwardView
    };
}

export function hideMessageForwardView() {
    return {
        type: types.ChatHideMessageForwardView
    };
}
