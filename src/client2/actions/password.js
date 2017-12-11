import { push,goBack } from 'react-router-redux'

import * as utils from '../lib/utils';

import * as types from './types';
import * as actions from '../actions';
import * as constant from '../lib/const';
import * as config from '../lib/config';
import * as strings from '../lib/strings';
import user from '../lib/user';

import {
    callUpdateProfile
} from '../lib/api/';

import {store} from '../index';

export function typeCurrentPassword(password) {

    return {
        type: types.PasswordTypeCurrentPassword,
        password
    }
    
}

export function typeNewPassword(password) {

    return {
        type: types.PasswordTypeNewPassword,
        password
    }
    
}

export function typeConfirmPassword(password) {

    return {
        type: types.PasswordTypeConfirmPassword,
        password
    }
    
}


export function cancel() {

    return (dispatch, getState) => {

        dispatch({
            type: types.PasswordCancel
        });

        store.dispatch(goBack());

    }

}
    

export function save() {
    
    return (dispatch, getState) => {

        dispatch({
            type: types.PasswordSave
        });

        const state = getState();
        
        let validationFailed = false;

        if(state.password.currentPassword.length < constant.CredentialsMinLength){
            dispatch({
                type: types.PasswordSaveValidationError,
                form: 1,
                error: strings.PasswordErrorPasswordValidation[user.lang]
            });
            validationFailed = true;
        }

        if(!constant.CredentialsRegex.test(state.password.currentPassword)){
            dispatch({
                type: types.PasswordSaveValidationError,
                form: 1,
                error: strings.PasswordErrorPasswordValidation[user.lang]
            });
            validationFailed = true;
        }

        if(state.password.newPassword.length < constant.CredentialsMinLength){
            dispatch({
                type: types.PasswordSaveValidationError,
                form: 2,
                error: strings.PasswordErrorPasswordValidation[user.lang]
            });
            validationFailed = true;
        }

        if(!constant.CredentialsRegex.test(state.password.newPassword)){
            dispatch({
                type: types.PasswordSaveValidationError,
                form: 2,
                error: strings.PasswordErrorPasswordValidation[user.lang]
            });
            validationFailed = true;
        }

        if(state.password.confirmPassword.length < constant.CredentialsMinLength){
            dispatch({
                type: types.PasswordSaveValidationError,
                form: 3,
                error: strings.PasswordErrorPasswordValidation[user.lang]
            });
            validationFailed = true;
        }

        if(!constant.CredentialsRegex.test(state.password.confirmPassword)){
            dispatch({
                type: types.PasswordSaveValidationError,
                form: 3,
                error: strings.PasswordErrorPasswordValidation[user.lang]
            });
            validationFailed = true;
        }

        if(state.password.confirmPassword != state.password.newPassword){
            dispatch({
                type: types.PasswordSaveValidationError,
                form: 3,
                error: strings.PasswordErrorConfirmFailed[user.lang]
            });
            validationFailed = true;
        }

        if(validationFailed)
            return;

        dispatch({
            type: types.PasswordSaveStart
        });
               
    }
}
