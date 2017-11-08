import { push } from 'react-router-redux'

import * as types from './types';
import * as actions from '../actions';
import {callGetUserList, callSearchUserList} from '../lib/api/';
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

export function searchUserList(value) {
    
    return (dispatch, getState) => {
        
        dispatch({
            type: types.UserListLoadStart
        });

        callSearchUserList(value)
        .then( (data) => {
            
            dispatch({
                type: types.UserListSearchSucceed, 
                data
            });

        })
        .catch( (err) => {
            dispatch(actions.notification.showToast(strings.FailedToSearchUserList[user.lang]));
            
            dispatch({
                type: types.UserListLoadFailed
            });

        });
    };
}
