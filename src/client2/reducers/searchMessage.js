import { combineReducers } from 'redux';
import * as types from '../actions/types';


const keyword = (state = "", action) => {
    switch (action.type) {
        case types.SearchMessageStart:
            return action.keyworkd;
        default:
            return state;
    }
};

const searchResult = (state = [], action) => {
    switch (action.type) {
        case types.SearchMessageSuccess:
            return action.messages;
        default:
            return state;
    }
};


const isLoading = (state = false, action) => {
    switch (action.type) {
        case types.SearchMessageStart:
            return true;
        case types.SearchMessageSuccess:
            return false;
        case types.SearchMessageFailed:
            return false;
        default:
            return state;
    }
};

export default combineReducers({
    isLoading,
    searchResult,
    keyword
});;
