import { browserHistory } from 'react-router'

import * as types from './types';
import * as actions from '../actions';

import {login} from '../lib/api/';
import * as strings from '../lib/strings';
import user from '../lib/user';

import {globalHistory} from '../index';

console.log('history',globalHistory);

export function onLoginClick(organization,username,password) {

    return (dispatch, getState) => {

        dispatch({
			type: types.LoginClick
        });

        login({organization,username,password})

        .then( (response) => {
            
            dispatch( {
                type: types.LoginSucceed,
                response
            });

            dispatch(actions.notification.showToast(strings.LoginSucceed[user.lang]));

            user.signinSucceed(response);

            globalHistory.push('/chat');

        }).catch( (err) => {

            dispatch( {
                type: types.LoginFailed,
                err
            });
            
            dispatch(actions.notification.showToast(strings.LoginFailed[user.lang]));

            console.warn(err);            

        });

        return Promise.resolve();

    };

}

export function onOrgChange(v) {
    return {
        type: types.LoginFormChangeOrganization,
        v
    };
}

export function onUserNameChange(v) {
    return {
        type: types.LoginFormChangeUsername,
        v
    };
}

export function onPasswordChange(v) {
    return {
        type: types.LoginFormChangePassword,
        v
    };
}

export function onRememberCheck(v){
    return {
        type: types.LoginFormCheckRemember,
        v
    };
}

export function onLoginSucceed(data){
    return {
        type: types.LoginSucceed,
        data
    };
}
