import * as types from './types';
import * as actions from '../actions';
import {callAddToFavorite, callGetMessageInfo} from '../lib/api/';
import * as strings from '../lib/strings';
import user from '../lib/user';
import {store} from '../index';

export function getMessageInfo(message) {

    return (dispatch, getState) => {

        dispatch({
            type: types.MessageInfoLoadStart,
            message
        });

        dispatch({
            type: types.ChatShowMessageInfoView
        })

        callGetMessageInfo(message._id)
        .then( data => {

            dispatch({
                type: types.MessageInfoLoadSucceed,
                data
            });

        })
        .catch( err => {

            dispatch(actions.notification.showToast(strings.FailedToLoadMessageInfo[user.lang]));
            
            dispatch({
                type: types.MessageInfoLoadFailed
            });

        })

    };

}

export function deleteMessage(messageID){
    return({
        type: types.MessageInfoDeleteMessage,
        messageID
    })
}

export function updateMessage(messageID, message){
    return({
        type: types.MessageInfoUpdateMessage,
        messageID,
        message
    })
}

// export function addToFavorite(messageId){}

