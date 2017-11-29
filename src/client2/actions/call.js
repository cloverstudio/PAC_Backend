import { push } from 'react-router-redux'

import * as types from './types';
import * as actions from '../actions';
import * as strings from '../lib/strings';
import user from '../lib/user';
import * as utils from '../lib/utils';
import * as constant from '../lib/const';

import {store} from '../index';

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

