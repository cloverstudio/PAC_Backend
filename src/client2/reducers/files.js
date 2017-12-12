import { combineReducers } from 'redux';
import * as types from '../actions/types';

//todo: deep copy state
const files = (state = {}, action) => {
    switch (action.type) {
        case types.ChatStartFileUpload: {
            // const newState = {...state};
            const newState = JSON.parse(JSON.stringify(state))
            newState[action.chatId] = { [action.localFileId] : 0};
            return newState; 
        }
        case types.ChatFileUploadSucceed: {
            // const newState = {...state};
            const newState = JSON.parse(JSON.stringify(state))            
            delete newState[action.chatId][action.localFileId];
            return newState; 
        }
        case types.ChatFileUploadFailed:
            //todo: handle error
        case types.ChatFileUploadProgress: {
            // const newState = {...state};
            const newState = JSON.parse(JSON.stringify(state))            
            newState[action.chatId][action.localFileId] = action.progress;
            return newState;
        }
        default:
            return state;
    }
};


// export default combineReducers({
//     files
// });;

export default files;