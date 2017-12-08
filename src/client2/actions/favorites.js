import { push } from 'react-router-redux'

import * as types from './types';
import * as actions from '../actions';
import {
    callGetUserList, 
    callSearchUserList,
    callLoadFavorites
} from '../lib/api/';
import * as strings from '../lib/strings';
import user from '../lib/user';
import {store} from '../index';


export function loadMessages(page) {

    return (dispatch, getState) => {

        dispatch({
            type: types.FavoriteLoadMessageStart,
            page
        });

        callLoadFavorites(page).then( (data) => {

            dispatch({
                type: types.FavoriteLoadMessageSuccess,
                messages:data.favorites
            });

        }).catch( (err) => {

            console.error(err);

            dispatch(actions.notification.showToast(strings.FailedToLoadFavorites[user.lang]));

            dispatch({
                type: types.FavoriteLoadMessageFailed
            });

        });
        
    };

}
