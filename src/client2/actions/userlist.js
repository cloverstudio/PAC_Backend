import { push } from 'react-router-redux'

import * as types from './types';
import * as actions from '../actions';
import {callGetUserList} from '../lib/api/';
import * as strings from '../lib/strings';
import user from '../lib/user';
import {store} from '../index';

export function loadUserList(page) {

    return (dispatch, getState) => {

        dispatch({
            type: types.UserListLoadStart
        });

        callGetUserList(page).then( (data) => {

            dispatch({
                type: types.UserListLoadSucceed,
                data
            });

        }).catch( (err) => {

            dispatch(actions.notification.showToast(strings.FailedToGetUserList[user.lang]));

            dispatch({
                type: types.UserListLoadFailed
            });

        });

    };

}

export function onLoadHistoryInitialSucceed(data) {
    
    return {
        type: types.HistoryLoadInitialSucceed,
        data
    };

}

export function onLoadHistoryInitialFailed(err) {
    
    return {
        type: types.HistoryLoadInitialFailed,
        err
    };

}