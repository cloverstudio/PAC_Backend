import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';

const notifications = (state = [], action) => {

    if(action.type == types.ChatReceiveMessage){

        if(action.currentChat)
            return state;

        return [action.message,...state]

    }

    if(action.type == types.ChatOpenByUser ||
        action.type == types.ChatOpenByGroup ||
        action.type == types.ChatOpenByRoom){

        return state.filter( (message) => {
            return message.roomID != action.chatId;
        });

    }
    
    return state;

};

export default combineReducers({
    notifications
});;
