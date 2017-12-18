import { combineReducers } from 'redux';
import * as types from '../actions/types';

const imgId = (state = '', action) => {
    switch(action.type){
        case types.ChatShowImageView:
            return action.imgId;
        case types.ChatHideImageView:
            return '';
        default:
            return state;
    }
};

export default combineReducers({
    imgId
});;
