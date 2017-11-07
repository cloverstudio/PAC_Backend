import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';

const loading = (state = false, action) => {
    switch (action.type) {
        case types.UserListLoadStart:
            return true;
        case types.UserListLoadSucceed:
            return false;
        case types.UserListLoadFaild:
            return false;
        default:
            return state;
    }
};

const users = (state = [], action) => {
    switch (action.type) {
        case types.UserListLoadSucceed:
            return action.data.list;
        default:
            return state;
    }
}

export default combineReducers({
    loading,
    users
});;
