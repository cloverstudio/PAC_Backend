import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';

const notificationState = (state = false, action) => {
    switch (action.type) {
        case types.MainShowNotification:
            return true;
        case types.MainHideNotification:
            return false;
        default:
            return state;
    }
};

export default combineReducers({
    notificationState
});;
