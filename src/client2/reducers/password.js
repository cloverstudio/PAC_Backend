import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';
import { isError } from 'util';

import * as constant from '../lib/const';

const currentPassword = (state = "", action) => {
    switch (action.type) {
        case types.PasswordTypeCurrentPassword:
            return action.password
        default:
            return state;
    }
}

const newPassword = (state = "", action) => {
    switch (action.type) {
        case types.PasswordTypeNewPassword:
            return action.password
        default:
            return state;
    }
}

const confirmPassword = (state = "", action) => {
    switch (action.type) {
        case types.PasswordTypeConfirmPassword:
            return action.password
        default:
            return state;
    }
}

const avatarImage = (state = null, action) => {
    switch (action.type) {
        case types.ProfileSelectFile:
            return action.file
        case types.ProfileDeleteFile:
            return null;
        case types.ProfileSaveSucceed:
            return null;
        case types.ProfileSelectFileByURL:
            return {};
            
        default:
            return state;
    }
}

const saving = (state = false, action) => {
    switch (action.type) {
        case types.PasswordSaveStart:
            return true
        case types.PasswordSaveSuccess:
            return false
        case types.PasswordSaveFailed:
            return false
        default:
            return state;
    }
}

const errorMessageCurrentPassword = (state = null, action) => {

    if(action.type == types.PasswordSave)
        return null;

    else if(action.type == types.PasswordSaveValidationError && action.form == 1)
        return action.error;

    else
        return state
    
}

const errorMessageNewPassword = (state = null, action) => {

    if(action.type == types.PasswordSave)
        return null;

    else if(action.type == types.PasswordSaveValidationError && action.form == 2)
        return action.error;

    else
        return state
    
}

const errorMessageConfirmPassword = (state = null, action) => {

    if(action.type == types.PasswordSave)
        return null;

    else if(action.type == types.PasswordSaveValidationError && action.form == 3)
        return action.error;

    else
        return state
    
}


export default combineReducers({
    currentPassword,
    newPassword,
    confirmPassword,
    errorMessageCurrentPassword,
    errorMessageNewPassword,
    errorMessageConfirmPassword,
    saving
});;
