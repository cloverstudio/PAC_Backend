import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';

const loading = (state = false, action) => {
    switch (action.type) {
        case types.UserListLoadStart:
            return true;
        case types.UserListLoadSucceed:
            return false;
        case types.UserListLoadFailed:
            return false;
        case types.UserListSearchSucceed:
            return false
        default:
            return state;
    }
};

const users = (state = [], action) => {
    switch (action.type) {
        case types.UserListLoadSucceed:
            let newData = action.data.list.filter(user => !state.find(oldUser => oldUser._id === user._id))
            return state.concat(newData);
        case types.UserListSearchSucceed:
            return action.data.list;
        case types.Logout:
            return [];
        default:
            return state;
    }
}

export default combineReducers({
    loading,
    users
});;
