import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';

import * as util from "../lib/utils";

let hisotryInitialLoadDone = false;

const notifications = (state = [], action) => {

    if (action.type == types.ChatReceiveMessage) {

        if (action.currentChat)
            return state;

        const message = action.message;

        const newNotifications = [{
            type: message.type,
            roomID: message.roomID,
            message: message.message,
            user: message.user,
            room: message.room,
            group: message.group,
            created: message.created,
            unreadCount: 1,
            _id: message._id
        }, ...state];

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

    if (!hisotryInitialLoadDone && action.type == types.HistoryLoadInitialSucceed) {

        const historyData = action.data.list;
        const notifications = [];
        let totalUnreadCount = 0;

        historyData.forEach((history) => {
            if (history.lastMessage) {
                if (history.unreadCount > 0) {

                    notifications.push({
                        _id: history._id,
                        roomID: util.getChatIdByHistory(history),
                        type: history.lastMessage.type,
                        message: history.lastMessage.message,
                        user: history.lastUpdateUser,
                        room: history.room,
                        group: history.group,
                        created: history.lastMessage.created,
                        unreadCount: history.unreadCount
                    });

                    totalUnreadCount += history.unreadCount;

                }
            }

        });

        hisotryInitialLoadDone = true;

        util.unreadMessageToWindowTitle(totalUnreadCount);

        return notifications;

    }

    return state;

};

export default combineReducers({
    notifications
});;
