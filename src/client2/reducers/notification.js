import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';

import * as util from "../lib/utils";

const notifications = (state = [], action) => {

    if (action.type == types.ChatReceiveMessage) {

        if (action.currentChat)
            return state;

        const newNotifications = [action.message, ...state];

        util.unreadMessageToWindowTitle(newNotifications.length);

        return newNotifications;

    }

    if (action.type == types.ChatOpenByUser ||
        action.type == types.ChatOpenByGroup ||
        action.type == types.ChatOpenByRoom) {

        const newNotifications = state.filter((message) => {
            return message.roomID != action.chatId;
        });

        util.unreadMessageToWindowTitle(newNotifications.length);

        return newNotifications;

    }

    if (action.type == types.HistoryMarkAllStart) {

        util.unreadMessageToWindowTitle(0);
        return [];

    }


    return state;

};

export default combineReducers({
    notifications
});;
