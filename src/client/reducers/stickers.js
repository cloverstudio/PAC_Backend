import { combineReducers } from 'redux';
import * as types from '../actions/types';

const loading = (state = false, action) => {
    switch (action.type) {
        case types.StickersLoadStart:
            return true;
        case types.StickersLoadSucceed:
            return false;
        case types.StickersLoadFailed:
            return false;
        default:
            return state;
    }
};

const stickers = (state = [], action) => {
    switch (action.type) {
        case types.StickersLoadSucceed:
            return action.data.stickers;
        default:
            return state;
    }
}

export default combineReducers({
    loading,
    stickers
});;
