import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';

const historyLoading = (state = false, action) => {
    switch (action.type) {
        case types.HistoryLoadInitial:
            return true;
        case types.HistoryLoadInitialSucceed:
            return false;
        case types.HistoryLoadInitialFailed:
            return false;
        default:
            return state;
    }
};


export default combineReducers({
    historyLoading
});;
