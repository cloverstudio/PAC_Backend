import { push } from 'react-router-redux'

import * as types from './types';
import * as actions from '../actions';
import * as strings from '../lib/strings';
import * as constant from '../lib/const';

import {
    callGetHistory,
    callBlock,callMute,
    callGroupUserList,
    callRoomUserList
} from '../lib/api/';

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

        callGroupUserList(
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

export function loadMembers() {
    
    return (dispatch, getState) => {

        const group = getState().infoView.group;
        const room = getState().infoView.room;

        let members = [];
        let lastMembersCount = constant.ApiDefauleListItemCount;
        let page = 1;

        if(group){

            function loadMember(page){

                callGroupUserList(
                    group._id,
                    page,
                ).then ( (result) => {
        
                    if(result.list){
        
                        members = members.concat(result.list);
                        
                        if(result.list.length >= constant.ApiDefauleListItemCount){
                            loadMember(++page);
                        }else{

                            dispatch({
                                type:types.InfoViewLoadMembersSuccess,
                                members
                            })

                        }

                    }else{
                        dispatch(actions.notification.showToast(strings.InfoViewFailedToLoadUserList[user.lang]));
                    }
        
                }).catch( (err) => {
                    
                    dispatch(actions.notification.showToast(strings.InfoViewFailedToLoadUserList[user.lang]));
        
                });
                
            }
            
            loadMember(page);

            return;
        }


        if(room){
            
            function loadMember(page){

                callRoomUserList(
                    room._id,
                    page,
                ).then ( (result) => {
        
                    if(result.list){
        
                        members = members.concat(result.list);
                        
                        if(result.list.length >= constant.ApiDefauleListItemCount){
                            
                            loadMember(++page);

                        }else{

                            dispatch({
                                type:types.InfoViewLoadMembersSuccess,
                                members
                            })

                        }

                    }else{

                        dispatch(actions.notification.showToast(strings.InfoViewFailedToLoadUserList[user.lang]));

                    }
        
                }).catch( (err) => {
                    
                    console.error(err);
                    dispatch(actions.notification.showToast(strings.InfoViewFailedToLoadUserList[user.lang]));
        
                });
                
            }
            
            loadMember(page);

            return;
        }

    }


}
