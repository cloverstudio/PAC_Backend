import { push, goBack } from 'react-router-redux'

import * as types from './types';
import * as actions from '../actions';
import * as strings from '../lib/strings';
import * as constant from '../lib/const';
import * as utils from '../lib/utils';

import {
    callGetHistory,
    callBlock, callMute,
    callGroupUserList,
    callRoomUserList,
    callLeaveRoom
} from '../lib/api/';

import user from '../lib/user';
import { store } from '../index';

import * as historyActions from './history';

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

export function updateMuteState(state, type) {

    return (dispatch, getState) => {

        let targetId = null;
        const targetUser = getState().infoView.user;
        const targetGroup = getState().infoView.group;
        const targetRoom = getState().infoView.room;

        if (targetUser._id)
            targetId = targetUser._id;
        if (targetGroup._id)
            targetId = targetGroup._id;
        if (targetRoom._id)
            targetId = targetRoom._id;

        callMute(
            state,
            targetId,
            type
        ).then((result) => {

            if (result !== undefined) {


            } else {
                dispatch(actions.notification.showToast(strings.InfoViewFailedToMute[user.lang]));
            }

        }).catch((err) => {
            dispatch(actions.notification.showToast(strings.InfoViewFailedToMute[user.lang]));
        });

    }

}

export function updateBlockState(state) {

    return (dispatch, getState) => {

        const targetUser = getState().infoView.user;

        if (!targetUser)
            return;

        callBlock(
            state,
            targetUser._id,
        ).then((result) => {

            if (result !== undefined) {


            } else {
                dispatch(actions.notification.showToast(strings.InfoViewFailedToBlock[user.lang]));
            }

        }).catch((err) => {

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

        if (group._id) {

            function loadMember(page) {

                callGroupUserList(
                    group._id,
                    page,
                ).then((result) => {

                    if (result.list) {

                        members = members.concat(result.list);

                        if (result.list.length >= constant.ApiDefauleListItemCount) {
                            loadMember(++page);
                        } else {

                            dispatch({
                                type: types.InfoViewLoadMembersSuccess,
                                members
                            })

                        }

                    } else {
                        dispatch(actions.notification.showToast(strings.InfoViewFailedToLoadUserList[user.lang]));
                    }

                }).catch((err) => {

                    console.error(err);
                    dispatch(actions.notification.showToast(strings.InfoViewFailedToLoadUserList[user.lang]));

                });


            }

            loadMember(page);
            return;
        }

        if (room._id) {

            function loadMember(page) {

                callRoomUserList(
                    room._id,
                    page,
                ).then((result) => {

                    if (result.list) {

                        members = members.concat(result.list);

                        if (result.list.length >= constant.ApiDefauleListItemCount) {

                            loadMember(++page);

                        } else {

                            dispatch({
                                type: types.InfoViewLoadMembersSuccess,
                                members
                            })

                        }

                    } else {

                        dispatch(actions.notification.showToast(strings.InfoViewFailedToLoadUserList[user.lang]));

                    }

                }).catch((err) => {

                    console.error(err);
                    dispatch(actions.notification.showToast(strings.InfoViewFailedToLoadUserList[user.lang]));

                });

            }

            loadMember(page);
            return;
        }

    }


}

export function deleteRoomConfirm(roomId) {
    return leaveRoomConfirm(roomId);
}

export function leaveRoomConfirm(roomId) {

    return (dispatch, getState) => {

        dispatch({
            type: types.InfoViewLeaveRoomConfirm,
            roomId
        });

    }

}

export function deleteRoom(roomId) {
    return leaveRoom(roomId);
}

export function leaveRoom(roomId) {

    return (dispatch, getState) => {

        const state = getState();

        dispatch({
            type: types.InfoViewLeaveRoomStart
        });

        callLeaveRoom(
            state.infoView.confirmRoomId
        ).then((result) => {

            dispatch({
                type: types.InfoViewLeaveRoomSucceed
            })


            // get first chat from history
            const historyList = state.history.historyList;

            console.log('historyList', historyList);
            const historyToOpen = historyList.find((history) => {
                return history.chatId != roomId;
            });


            //dispatch(push(`${utils.url('/chat/')}`));
            store.dispatch(goBack());
            dispatch(historyActions.loadHistoryInitial());

        }).catch((err) => {

            console.error(err);

            dispatch(actions.notification.showToast(strings.InfoViewFailedToLeave[user.lang]));

            dispatch({
                type: types.InfoViewLeaveRoomFailed
            })

        });
    }

}
