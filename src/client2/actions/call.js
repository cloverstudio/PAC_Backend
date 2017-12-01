import { push } from 'react-router-redux'
import getUserMedia from 'getusermedia';

import * as types from './types';
import * as actions from '../actions';
import * as strings from '../lib/strings';
import user from '../lib/user';
import * as utils from '../lib/utils';
import * as constant from '../lib/const';

import {store} from '../index';
import { setTimeout } from 'timers';

// local scope stuff
let localstream = null;



export function incomingCall(callData){
    return {
        type: types.CallIncoming,
        call:callData
    }
}

export function incomingCallClose(){
    return {
        type: types.CallIncomingClose
    }
}

export function incomingCallReject(){

    return {
        type: types.CallIncomingReject
    }
}

export function incomingCallAccept(){
    
        return {
            type: types.CallIncomingAccept
        }
    }
    

export function outgoingCall(callData){

    return (dispatch, getState) => {

        dispatch({
            type: types.CallOutgoing,
            call: callData
        });

        dispatch(outgoingCallStatusChanged(strings.CallOutgoingStatusInitializingMedia[user.lang]));

        new Promise( (resolve,reject) => {

            getUserMedia({video: (callData.mediaType == constant.CallMediaTypeVideo), audio: true}, (err, stream) => {
                
                localstream = stream;

                if(err){
                    reject(strings.CallOutgoingMediaError[user.lang]);
                } else {
                    resolve(stream);
                }
                
            });
            
        })

        .then( (stream) => {

            dispatch(outgoingCallStatusChanged(strings.CallOutgoingStatusConnecting[user.lang]));

            dispatch({
                type: types.CallOutgoingConnect,
                call: callData,
                stream
            });

        })
        
        .catch( (err) => {

            console.error(err);
            dispatch(outgoingCallFailed(strings.CallOutgoingMediaError[user.lang]));

        });


    }

}

export function outgoingCallStatusChanged(message){
    return {
        type: types.CallOutgoingStatusChanged,
        message
    }
}

export function outgoingCallClose(){
    
    console.log(localstream);

    if(localstream)
        localstream.stop();

    return {
        type: types.CallOutgoingClose
    }
}

export function outgoingCallFailed(message){

    if(localstream)
        localstream.stop();

    return (dispatch, getState) => {

        dispatch(outgoingCallStatusChanged(message));

        setTimeout( () => {

            dispatch( {
                type: types.CallOutgoingFailed,
                message
            });

        },3000);


    };
}
