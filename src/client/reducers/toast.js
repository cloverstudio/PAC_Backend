import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';

const showing = (state = false, action) => {
    switch (action.type) {
        case types.ToastShow:
            return true;
        case types.ToastHide:
            return false;
        default:
            return state;
    }
};

const message = (state = "", action) => {
    switch (action.type) {
        case types.ToastShow:
            return action.message;
        case types.ToastHide:
            return "";
        default:
            return state;
    }
};

export default combineReducers({
    showing,
    message
});;
