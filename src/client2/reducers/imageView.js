import { combineReducers } from 'redux';
import * as types from '../actions/types';

const imgId = (state = '', action) => {
    switch(action.type){
        case types.ChatShowImageView:
            return action.imgId;
        default:
            return state;
    }
};

export default combineReducers({
    imgId
});;
