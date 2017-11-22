import { push,goBack } from 'react-router-redux'

import * as utils from '../lib/utils';

import * as types from './types';
import * as actions from '../actions';
import {callSearchUserList,createRoom} from '../lib/api/';
import * as strings from '../lib/strings';
import user from '../lib/user';
import {store} from '../index';

export function searchUserList(value) {
    
    return (dispatch, getState) => {
        
        dispatch({
            type: types.CreateRoomSearchUserStart,
            keyword: value
        });

        callSearchUserList(value)
        .then( (data) => {

            dispatch({
                type: types.CreateRoomSearchUserSucceed, 
                data,
                members: getState().createRoom.members
            });
            

        })
        .catch( (err) => {

            dispatch(actions.notification.showToast(strings.FailedToSearchUserList[user.lang]));
            
            dispatch({
                type: types.CreateRoomSearchUserFailed
            });

        });
    };
}

export function save() {
    return (dispatch, getState) => {

        dispatch({
            type: types.CreateRoomSaveStart
        });

        const state = getState();

        createRoom(
            state.createRoom.members,
            state.createRoom.name,
            state.createRoom.description,
            state.createRoom.avatarImage
        ).then ( (room) => {

            const chatId = utils.chatIdByRoom(room);

            dispatch({
                type: types.CreateRoomSaveSucceed,
                room
            });

            dispatch(push(`/chat/${chatId}`));
    
            dispatch({
                type: types.ChatOpenByRoom,
                room,
                chatId
            });

        }).catch( (err) => {

            dispatch(actions.notification.showToast(strings.FailedToCreateRoom[user.lang]));
            
            dispatch({
                type: types.CreateRoomSaveFailed
            });

        });

    }
}

export function typeKeyword(keyword) {

    return {
        type: types.CreateRoomTypeKeyword,
        keyword
    }
    
}

export function typeName(name) {

    return {
        type: types.CreateRoomTypeName,
        name
    }
    
}

export function typeDescription(description) {
    
    return {
        type: types.CreateRoomTypeDescription,
        description
    }
    
}

export function selectFile(file) {
    
    return (dispatch, getState) => {

        let reader = new FileReader();
        
        reader.onloadend = () => {

            dispatch( {
                type: types.CreateRoomSelectFile,
                file,
                fileUrl: reader.result
            });

        }

        reader.readAsDataURL(file)

    }
    
}

export function deleteFile(file) {
    
    return {
        type: types.CreateRoomDeleteFile
    }
    
}


export function addMember(user) {

    return {
        type: types.CreateRoomAddMember,
        user
    }
    
}

export function deleteMember(user) {
    
    return {
        type: types.CreateRoomDeleteMember,
        user
    }
    
}


export function cancel() {

    return (dispatch, getState) => {

        dispatch({
            type: types.CreateRoomCancel
        });

        store.dispatch(goBack());

    }

}
