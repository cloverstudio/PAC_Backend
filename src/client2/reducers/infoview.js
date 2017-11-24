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
    room:null,
    isLoading: false,
    blocked: false,
    muted: false,
    members: []
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

const isLoading = (state = initial.isLoading, action) => {
    
    switch (action.type) {
        case types.ChatOpenByUser:
            return true;
         case types.ChatOpenByGroup:
            return true;
        case types.ChatOpenByRoom:
            return true;
        case types.InfoViewLoadDone:
            return false;
        default:
            return state;
    }
}


const blocked = (state = initial.blocked, action) => {
    
    switch (action.type) {
        case types.InfoViewLoadBlockState:
            return action.state;
        default:
            return state;
    }
}

const muted = (state = initial.muted, action) => {
    
    switch (action.type) {
        case types.InfoViewLoadMuteState:
            return action.state;
        default:
            return state;
    }
}

const members = (state = initial.members, action) => {
    
    switch (action.type) {
        case types.InfoViewLoadMembersSuccess:
            return action.members;
        default:
            return state;
    }
}




export default combineReducers({
    user,
    group,
    room,
    isLoading,
    muted,
    blocked,
    members
});