import { combineReducers } from 'redux';
import * as types from '../actions/types';

const loading = (state = false, action) => {
    switch (action.type) {
        case types.GroupListLoadStart:
            return true;
        case types.GroupListLoadSucceed:
            return false;
        case types.GroupListLoadFailed:
            return false;
        case types.GroupListSearchSucceed:
            return false
        default:
            return state;
    }
};

const groups = (state = [], action) => {
    switch (action.type) {
        case types.GroupListLoadSucceed:
            let newData = action.data.list.filter(group => !state.find(oldGroup => oldGroup._id === group._id))
            return state.concat(newData);
        case types.GroupListSearchSucceed:
            return action.data.list
        default:
            return state;
    }
}

export default combineReducers({
    loading,
    groups
});;
