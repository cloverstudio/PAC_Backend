import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';

import * as constants from '../lib/const';
import * as utils from '../lib/utils';

import Encryption from '../lib/encryption/encryption';

const historyLoading = (state = false, action) => {
    switch (action.type) {
        case types.HistoryLoadInitial:
            return true;
        case types.HistoryLoadInitialSucceed:
            return false;
        case types.HistoryLoadInitialFailed:
            return false;
        case types.HistoryLoadStart:
            return true;
        case types.HistoryLoadSucceed:
            return false;
        case types.HistoryLoadFailed:
            return false;
        case types.HistorySearchStart:
            return true;
        case types.HistorySearchSucceed:
            return false;
        case types.HistorySearchFailed:
            return false;
        default:
            return state;
    }
};

const historyList = (state = [], action) => {
    switch (action.type) {
        case types.HistoryLoadInitialSucceed:
            return action.data.list;
        case types.HistoryLoadSucceed:
            return state.concat(action.data.list);
        case types.HistorySearchSucceed:
            return action.data.list;
    }

    if (action.type == types.ChatReceiveMessage) {

        const newMessage = action.message;
        const chunks = newMessage.roomID.split('-');
        let chatId = chunks[chunks.length - 1];
        let chatType = chunks[0];

        if (chatType == constants.ChatTypePrivate) {
            chatId = utils.getTargetUserIdFromRoomId(newMessage.roomID);
        }

        let isExists = false;

        const newHistoryList = state.map((history) => {

            if (history.chatId == chatId) {

                isExists = true;

                newMessage.message = Encryption.decryptText(newMessage.message);
                history.lastUpdate = newMessage.created;
                history.lastMessage = newMessage;
                history.lastUpdateUser = newMessage.user;

                if (!action.currentChat)
                    history.unreadCount = history.unreadCount + 1;

            }

            return history;

        });

        if (isExists) {
            return newHistoryList.sort((obj1, obj2) => {
                return -1 * (obj1.lastUpdate - obj2.lastUpdate);
            });
        } else {

        }

    }

    if (action.type == types.ChatOpenByUser ||
        action.type == types.ChatOpenByGroup ||
        action.type == types.ChatOpenByRoom) {

        const chunks = action.chatId.split('-');
        let chatId = chunks[chunks.length - 1];

        if (action.type == types.ChatOpenByUser)
            chatId = utils.getTargetUserIdFromRoomId(action.chatId);

        const newHistoryList = state.map((history) => {

            if (history.chatId == chatId)
                history.unreadCount = 0;

            return history;

        });

        return newHistoryList;

    }


    return state;
}

export default combineReducers({
    historyLoading,
    historyList
});;
