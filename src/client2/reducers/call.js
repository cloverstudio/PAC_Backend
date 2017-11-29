import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';
import * as constant from '../lib/const';

const incomingcallRinging = (state = false, action) => {
    switch (action.type) {
        case types.CallIncoming:
            return true;
        case types.CallIncomingClose:
            return false;
        case types.CallIncomingReject:
            return false;
        default:
            return state;
    }
};

const incomingcallUser = (state = {}, action) => {
    switch (action.type) {
        case types.CallIncoming:
            return action.call.user;
        default:
            return state;
    }
};


export default combineReducers({
    incomingcallRinging,
    incomingcallUser
});;
