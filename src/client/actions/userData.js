import * as types from './types';
import * as actions from '../actions';
import { callGetUserDetail } from '../lib/api/';
import * as strings from '../lib/strings';
import { store } from '../index';
import user from '../lib/user';

export function loadNewestUserData() {

    return (dispatch, getState) => {

        callGetUserDetail(user.userData._id)
            .then(data => {

                dispatch({
                    type: types.userDataNewLoad,
                    data
                })
            })
    }

}