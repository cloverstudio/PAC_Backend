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

export function typeName(name) {

    return {
        type: types.ProfileTypeName,
        name
    }
    
}

export function typeDescription(description) {
    
    return {
        type: types.ProfileTypeDescription,
        description
    }
    
}

export function selectFile(file) {
    
    return (dispatch, getState) => {

        let reader = new FileReader();
        
        reader.onloadend = () => {

            dispatch( {
                type: types.ProfileSelectFile,
                file,
                fileUrl: reader.result
            });

        }

        reader.readAsDataURL(file)

    }
    
}


export function deleteFile() {
    
    return {
        type: types.ProfileDeleteFile
    }
    
}

export function selectFileByURL(url) {
    
    return {
        type: types.ProfileSelectFileByURL,
        url
    }
    
}

export function initProfileView(user) {

    return (dispatch, getState) => {

        dispatch(typeName(user.name));
        dispatch(typeDescription(user.description));


        if(user.avatar && user.avatar.thumbnail) {
            const fileId = user.avatar.thumbnail.nameOnServer;
            dispatch(selectFileByURL(config.APIEndpoint + constant.ApiUrlGetUserAvatar + fileId));
        }
    }
    
}

export function cancel() {

    return (dispatch, getState) => {

        dispatch({
            type: types.RoomCancel
        });

        store.dispatch(goBack());

    }

}
    

export function save() {
    
    return (dispatch, getState) => {

        const state = getState();
        
        dispatch({
            type: types.ProfileSaveStart
        });

        callUpdateProfile(
            state.profile.name,
            state.profile.description,
            state.profile.avatarImage
        ).then ( (savedUser) => {

            dispatch({
                type: types.ProfileSaveSucceed,
                user
            });

            user.updateUserData(savedUser);

            console.log('user.userData',user.userData);
            
            dispatch(initProfileView(user.userData));

        }).catch( (err) => {
            
            console.error(err);

            dispatch(actions.notification.showToast(strings.FailedToSaveProfile[user.lang]));
            
            dispatch({
                type: types.ProfileSaveFailed
            });

        });



    }
}
