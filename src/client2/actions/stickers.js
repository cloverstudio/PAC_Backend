import { push } from 'react-router-redux'

import * as types from './types';
import * as actions from '../actions';
import {callGetStickers} from '../lib/api/';
import * as strings from '../lib/strings';
import {store} from '../index';
import user from '../lib/user';

export function loadStickers() {

    return (dispatch, getState) => {

        dispatch({
            type: types.StickersLoadStart
        });

        callGetStickers().then( (data) => {

            dispatch({
                type: types.StickersLoadSucceed,
                data
            });

        }).catch( (err) => {

            dispatch(actions.notification.showToast(strings.FailedToGetStickers[user.lang]));

            dispatch({
                type: types.StickersLoadFailed
            });

        });

    };

}
