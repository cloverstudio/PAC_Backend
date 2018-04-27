import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';

import * as constants from '../lib/const';
import * as utils from '../lib/utils';
import user from '../lib/user';

import Encryption from '../lib/encryption/encryption';


const keyword = (state = "", action) => {
    switch (action.type) {
        case types.HistoryTypeKeyword:
            return action.keyword
        default:
            return state;
    }
};

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

    if (action.type == types.HistoryLoadInitialSucceed) {
        let oldState = state;
        let currentChatId = action.currentChatId;

        let newHistoryList = action.data.list.map(historyObj => {

            if (historyObj.unreadCount > 0) {
                let historyObjChatId = utils.getChatIdByHistory(historyObj);

                if (currentChatId === historyObjChatId) {
                    historyObj.unreadCount = 0;
                    return historyObj;
                }

                let oldStateMatchObj = oldState.find(oldHistoryObj => oldHistoryObj.chatId === historyObj.chatId);

                if (oldStateMatchObj) {
                    if (oldStateMatchObj.unreadCount === 0
                        && oldStateMatchObj.lastMessage.messageId === historyObj.lastMessage.messageId) {
                        historyObj.unreadCount = 0;
                    }
                }

                return historyObj;

            }
            else {
                return historyObj;
            }

        });

        let sortedByLastUpdate = utils.stableSort(newHistoryList, utils.sortHistoryByLastUpdate)
        let sortedByPin = utils.stableSort(sortedByLastUpdate, utils.sortHistoryByPin);
        return sortedByPin;
    }

    if (action.type == types.HistoryLoadSucceed) {
        return state.concat(action.data.list);
    }

    if (action.type == types.HistorySearchSucceed) {
        return action.data.list;
    }

    if (action.type == types.InfoViewTogglePinState) {
        let newHistoryList = state.map(historyObj => {

            if (historyObj.chatId === action.targetId) {
                historyObj.pinned = action.newState;
            }

            return historyObj;

        });

        let sortedByLastUpdate = utils.stableSort(newHistoryList, utils.sortHistoryByLastUpdate)
        let sortedByPin = utils.stableSort(sortedByLastUpdate, utils.sortHistoryByPin);
        return sortedByPin;
    }

    if (action.type == types.Logout) {
        return [];
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

                if (!action.currentChat && newMessage.user._id !== user.userData._id)
                    history.unreadCount = history.unreadCount + 1;

            }

            return history;

        });


        let sortedByLastUpdate = utils.stableSort(newHistoryList, utils.sortHistoryByLastUpdate)
        let sortedByPin = utils.stableSort(sortedByLastUpdate, utils.sortHistoryByPin);
        return sortedByPin;

    }

    if (action.type == types.ChatUpdateMessages) {

        return state.map(historyObj => {

            if (historyObj.lastMessage != null) {

                let match = action.updatedMessages.find(msg => msg._id == historyObj.lastMessage._id)

                if (typeof match !== 'undefined') {
                    if (match.message != '') {
                        historyObj.lastMessage.message = Encryption.decryptText(match.message);
                    }
                    else {
                        historyObj.lastMessage = null;
                    }
                }
            }

            return historyObj;
        })
    }

    // make unread count to zero
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

const pinnedChatIDs = (state = [], action) => {
    switch (action.type) {
        case types.InfoViewTogglePinState:

            return action.newState
                ? state.concat(action.targetId)
                : state.filter(pinnedId => pinnedId !== action.targetId);

        case types.HistoryLoadInitialSucceed:

            return action.data.list.filter(historyObj => historyObj.pinned)
                .map(pinnedHistory => pinnedHistory.chatId)

        default:
            return state;
    }
}

export default combineReducers({
    historyLoading,
    historyList,
    keyword,
    pinnedChatIDs
});
