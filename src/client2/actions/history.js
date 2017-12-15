import { push } from 'react-router-redux'

import * as types from './types';
import * as actions from '../actions';

import {
    callGetHistory,
    callMarkAll
} from '../lib/api/';

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

export function markAll(){

    return (dispatch, getState) => {

        dispatch({
            type:types.HistoryMarkAllStart
        })
        
        callMarkAll().then( () => {

            dispatch({
                type:types.HistoryMarkAllSucceed
            })

            dispatch(loadHistoryInitial());

        }).catch( (err) => {

            dispatch(actions.notification.showToast(strings.FailedToMarkAll[user.lang]));

            dispatch({
                type:types.HistoryMarkAllFailed
            })

        });

    }

}
