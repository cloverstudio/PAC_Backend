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

    let deviceWorks = false;

    return (dispatch, getState) => {

        dispatch({
            type: types.CallIncoming,
            call:callData
        });

        dispatch(incomingCallStatusChanged(strings.CallInitializingDevice[user.lang]));

        setTimeout( () => {

            if(!deviceWorks){
                dispatch(incomingCallStatusChanged(strings.CallFailedToInitizeDevice[user.lang]));
                dispatch(incomingCallMediaFailed(callData));
            }

        },10000);

        new Promise( (resolve,reject) => {

            getUserMedia({video: (callData.mediaType == constant.CallMediaTypeVideo), audio: true}, (err, stream) => {

                deviceWorks = true;
                localstream = stream;

                setTimeout( () => {

                    if(stream)
                        stream.stop();

                },1000);


                if(err){
                    reject(err);
                } else {
                    resolve(stream);
                }
                
            });
            
        })

        .then( (stream) => {

            dispatch(incomingCallMediaReady(callData));

        })
        
        .catch( (err) => {

            console.error(err);
            dispatch(incomingCallStatusChanged(strings.CallFailedToInitizeDevice[user.lang]));
            dispatch(incomingCallMediaFailed(callData));

        });

    }
}

export function incomingCallStatusChanged(message){
    return {
        type: types.CallIncomingStatusChanged,
        message
    }
}


export function incomingCallMediaReady(callData){
    return {
        type: types.CallIncomingMediaReady,
        call:callData
    }
}

export function incomingCallMediaFailed(callData){

    return (dispatch, getState) => {

        setTimeout( () => {
            
            dispatch({
                type: types.CallIncomingMediaFailed,
                call:callData
            });

        },5000);

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

                setTimeout( () => {

                    if(stream)
                        stream.stop();

                },1000);

                if(err){
                    reject(err);
                } else {
                    resolve(stream);
                }
                
            });
            
        })

        .then( (stream) => {

            dispatch(outgoingCallStatusChanged(strings.CallOutgoingStatusConnecting[user.lang]));

            dispatch({
                type: types.CallOutgoingConnect,
                call: callData
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

export function outgoingCallAnswered(){

    if(localstream)
        localstream.stop();

    return {
        type: types.CallOutgoingAnswered
    }
}

export function callClose(){
    
    return {
        type: types.CallClose
    }

}

export function  callFinish(){

    return {
        type: types.CallFinish
    }

}
    
export function  callMute(){

    return {
        type: types.CallMute
    }

}
    
export function  callUnMute(){

    return {
        type: types.CallUnMute
    }

}

export function  callStartVideo(){

    return {
        type: types.CallStartVideo
    }

}

export function  callStopVideo(){

    return {
        type: types.CallStopVideo
    }

}

export function  setWindowState(state){

    return {
        type: types.CallChangeWindowState,
        state
    }

}


