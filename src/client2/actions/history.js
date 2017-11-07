import { push } from 'react-router-redux'

import * as types from './types';
import * as actions from '../actions';
import {callGetHistory} from '../lib/api/';
import * as strings from '../lib/strings';
import user from '../lib/user';
import {store} from '../index';

export function loadHistoryInitial() {

    return (dispatch, getState) => {

        dispatch({
            type: types.HistoryLoadInitial
        });

        callGetHistory(1).then( (data) => {

            dispatch({
                type: types.HistoryLoadInitialSucceed,
                data
            });

        }).catch( (err) => {

            dispatch(actions.notification.showToast(strings.FailedToGetHistory[user.lang]));

            dispatch({
                type: types.HistoryLoadInitialFailed
            });

        });

    };

}

export function loadHistory(page) {

    return (dispatch, getState) => {

        dispatch({
            type: types.HistoryLoadStart
        });

        callGetHistory(page).then( (data) => {

            dispatch({
                type: types.HistoryLoadSucceed,
                data
            });

        }).catch( (err) => {

            dispatch(actions.notification.showToast(strings.FailedToGetHistory[user.lang]));

            dispatch({
                type: types.HistoryLoadFailed
            });

        });

    };

}

export function onLoadHistoryInitialSucceed(data) {
    
    return {
        type: types.HistoryLoadInitialSucceed,
        data
    };

}

export function onLoadHistoryInitialFailed(err) {
    
    return {
        type: types.HistoryLoadInitialFailed,
        err
    };

}