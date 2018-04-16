import { push } from 'react-router-redux'

import * as types from './types';
import * as actions from '../actions';

import { callLogin } from '../lib/api/';
import * as strings from '../lib/strings';
import * as util from '../lib/utils';
import user from '../lib/user';

import { store } from '../index';

export function onLoginClick(organization, username, password, remember) {

    return (dispatch, getState) => {

        dispatch({
            type: types.LoginClick
        });

        callLogin({ organization, username, password })

            .then((response) => {

                dispatch({
                    type: types.LoginSucceed,
                    response
                });

                dispatch(actions.notification.showToast(strings.LoginSucceed[user.lang]));

                user.signinSucceed(response, remember);

                store.dispatch(push(`${util.url('/chat')}`));

            }).catch((err) => {

                dispatch({
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

export function onRememberCheck(v) {
    return {
        type: types.LoginFormCheckRemember,
        v
    };
}

export function onLoginSucceed(data) {
    return {
        type: types.LoginSucceed,
        data
    };
}
