import { push } from 'react-router-redux'


import * as types from './types';
import * as actions from '../actions';
import {callGetMessageList} from '../lib/api/';
import * as strings from '../lib/strings';
import user from '../lib/user';
import * as utils from '../lib/utils';
import * as constant from '../lib/const';

import {store} from '../index';

export function openChatByUser(targetUser) {
    
    return (dispatch, getState) => {

        dispatch({
            type: types.ChatOpenByUser,
            user: targetUser
        });
        
        const chatId = utils.chatIdByUser(targetUser);

        callGetMessageList(chatId,0,constant.ChatDirectionNew).then( (data) => {

            dispatch({
                type: types.ChatLoadMessageSucceed,
                messages: data.messages
            });

        }).catch( (err) => {

            dispatch(actions.notification.showToast(strings.FailedToLoatMessage[user.lang]));

            dispatch({
                type: types.ChatLoadMessageFailed
            });

        });
                    
    }

}

export function openChatByGroup(group) {

    return (dispatch, getState) => {
        
        dispatch({
            type: types.ChatOpenByGroup,
            group
        });
        
        const chatId = utils.chatIdByGroup(group);

        callGetMessageList(chatId,0,constant.ChatDirectionNew).then( (data) => {

            dispatch({
                type: types.ChatLoadMessageSucceed,
                messages: data.messages
            });

        }).catch( (err) => {

            dispatch(actions.notification.showToast(strings.FailedToLoatMessage[user.lang]));

            dispatch({
                type: types.ChatLoadMessageFailed
            });

        });
    }

}

export function openChatByRoom(room) {
    
    
    return (dispatch, getState) => {

        dispatch({
            type: types.ChatOpenByRoom,
            room
        });
    
        const chatId = utils.chatIdByRoom(room);

        callGetMessageList(chatId,0,constant.ChatDirectionNew).then( (data) => {

            dispatch({
                type: types.ChatLoadMessageSucceed,
                messages: data.messages
            });

        }).catch( (err) => {

            dispatch(actions.notification.showToast(strings.FailedToLoatMessage[user.lang]));

            dispatch({
                type: types.ChatLoadMessageFailed
            });

        });
        
    }

}
