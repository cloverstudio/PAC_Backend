import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';

import * as constant from '../lib/const';
import * as types from '../actions/types';

const initial = {
    user:{
        name:"",
        description: "",
        token:[]
    },
    group:null,
    room:null
}

const user = ( state = initial.user, action ) => {

    switch (action.type) {
        case types.ChatOpenByUser:
            return action.user;
        default:
            return state;
    }

}

const group = ( state = initial.group, action ) => {
    
        switch (action.type) {
             case types.ChatOpenByGroup:
                return action.group;
            default:
                return state;
        }
    
    }

const room = ( state = initial.room, action ) => {
    
    switch (action.type) {
        case types.ChatOpenByRoom:
            return action.room;
        default:
            return state;
    }

}

    

export default combineReducers({
    user,
    group,
    room
});