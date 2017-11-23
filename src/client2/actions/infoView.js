import { push } from 'react-router-redux'

import * as types from './types';
import * as actions from '../actions';
import * as strings from '../lib/strings';

import {callGetHistory,callBlock,callMute} from '../lib/api/';
import user from '../lib/user';
import {store} from '../index';

export function loadDone() {
    
    return {
        type: types.InfoViewLoadDone
    };

}

export function loadMuteState(state) {
    
    return {
        type: types.InfoViewLoadMuteState,
        state
    };

}

export function loadBlockState(state) {
    
    return {
        type: types.InfoViewLoadBlockState,
        state
    };

}

export function updateMuteState(state,type){

    return (dispatch, getState) => {

        let targetId = null;
        const targetUser = getState().infoView.user;
        const targetGroup = getState().infoView.group;
        const targetRoom = getState().infoView.room;

        if(targetUser)
            targetId = targetUser._id;
        if(targetGroup)
            targetId = targetGroup._id;
        if(targetRoom)
            targetId = targetRoom._id;

        callMute(
            state,
            targetId,
            type
        ).then ( (result) => {

            if(result !== undefined){



            }else{
                dispatch(actions.notification.showToast(strings.InfoViewFailedToMute[user.lang]));
            }

        }).catch( (err) => {
            dispatch(actions.notification.showToast(strings.InfoViewFailedToMute[user.lang]));
        });

    }

}

export function updateBlockState(state){

    return (dispatch, getState) => {

        const targetUser = getState().infoView.user;

        if(!targetUser)
            return;

        callBlock(
            state,
            targetUser._id,
        ).then ( (result) => {

            if(result !== undefined){

                

            }else{
                dispatch(actions.notification.showToast(strings.InfoViewFailedToBlock[user.lang]));
            }

        }).catch( (err) => {
            
            dispatch(actions.notification.showToast(strings.InfoViewFailedToBlock[user.lang]));

        });

    }

}