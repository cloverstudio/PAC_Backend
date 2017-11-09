import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';

import login from './login';
import toast from './toast';
import chatUI from './chatUI';
import history from './history';
import userlist from './userlist';
import grouplist from './grouplist';
import chat from './chat';
import infoview from './infoview';

const filter = (state = '', action) => {
    switch (action.type) {
        case types.FILTER:
            return action.filter;
        default:
            return state;
    }
};

const rootReducer = combineReducers({
    login,
    toast,
    filter,
    routing,
    chatUI,
    history,
    userlist, 
    grouplist,
    chat,
    infoview
});

export default rootReducer;
