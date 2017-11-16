import * as types from './types';
import * as actions from '../actions';
import {login} from '../lib/api/';
import { globalStore } from '../index';

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




