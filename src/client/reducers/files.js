import { combineReducers } from 'redux';
import * as types from '../actions/types';

const files = (state = {}, action) => {
    switch (action.type) {
        case types.ChatStartFileUpload: {

            const newState = JSON.parse(JSON.stringify(state));

            if (typeof newState[action.chatId] === 'undefined') {
                newState[action.chatId] = {};
            }

            newState[action.chatId][action.localFileId] = {

                userID: action.userID,
                created: action.created,
                progress: 0,
                type: action.MsgType,
                localID: action.localFileId
            }

            return newState;
        }
        case types.ChatFileUploadSucceed: {

            const newState = JSON.parse(JSON.stringify(state))
            delete newState[action.chatId][action.localFileId];
            return newState;
        }
        case types.ChatFileUploadFailed:
        //todo: handle error
        case types.ChatFileUploadProgress: {

            const newState = JSON.parse(JSON.stringify(state))
            newState[action.chatId][action.localFileId].progress = action.progress;
            return newState;
        }
        case types.ChatFileUploadAbortSuccess: {
            const newState = JSON.parse(JSON.stringify(state))
            delete newState[action.chatID][action.localID];
            return newState;
        }
        default:
            return state;
    }
};

export default files;


