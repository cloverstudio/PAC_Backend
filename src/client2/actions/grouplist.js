import * as types from './types';
import * as actions from '../actions';
import {callGetGroupList, callSearchGroupList} from '../lib/api/';
import * as strings from '../lib/strings';
import user from '../lib/user';
import {store} from '../index';

export function loadGroupList(page) {

    return (dispatch, getState) => {

        dispatch({
            type: types.GroupListLoadStart
        });

        callGetGroupList(page).then( (data) => {

            dispatch({
                type: types.GroupListLoadSucceed,
                data
            });

        }).catch( (err) => {

            dispatch(actions.notification.showToast(strings.FailedToGetGroupList[user.lang]));

            dispatch({
                type: types.GroupListLoadFailed
            });

        });

    };

}

export function searchGroupList(value) {
    
    return (dispatch, getState) => {
        
        dispatch({
            type: types.GroupListLoadStart
        });

        callSearchGroupList(value)
        .then( (data) => {
            
            dispatch({
                type: types.GroupListSearchSucceed, 
                data
            });

        })
        .catch( (err) => {
            dispatch(actions.notification.showToast(strings.FailedToSearchGroupList[user.lang]));
            
            dispatch({
                type: types.GroupListLoadFailed
            });

        });
    };
}
