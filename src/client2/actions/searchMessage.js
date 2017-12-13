import { push } from 'react-router-redux'

import * as types from './types';
import * as actions from '../actions';
import {
    callGetUserList, 
    callSearchUserList,
    callSearchMessage
} from '../lib/api/';
import * as strings from '../lib/strings';
import user from '../lib/user';
import {store} from '../index';


export function searchMessage(keyword) {

    return (dispatch, getState) => {

        dispatch({
            type: types.SearchMessageStart,
            keyword
        });

        callSearchMessage(keyword).then( (data) => {

            dispatch({
                type: types.SearchMessageSuccess,
                messages:data.messages
            });

        }).catch( (err) => {

            dispatch(actions.notification.showToast(strings.FailedToSearchMessage[user.lang]));

            dispatch({
                type: types.SearchMessageFailed
            });

        });
        
    };

}
