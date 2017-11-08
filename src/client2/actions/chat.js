import { push } from 'react-router-redux'

import * as types from './types';
import * as actions from '../actions';
import {callGetUserList} from '../lib/api/';
import * as strings from '../lib/strings';
import user from '../lib/user';
import {store} from '../index';

export function openChatByUser(user) {
    
    return {
        type: types.ChatOpenByUser,
        user
    };

}

export function openChatByGroup(group) {
    
    return {
        type: types.ChatOpenByGroup,
        group
    };

}

export function openChatByRoom(room) {
    
    return {
        type: types.ChatOpenByRoom,
        room
    };

}
