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
        case types.HistoryLoadStart:
            return true;
        case types.HistoryLoadSucceed:
            return false;
        case types.HistoryLoadFailed:
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

        default:
            return state;
    }
}

export default combineReducers({
    historyLoading,
    historyList
});;
