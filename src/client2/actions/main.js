import * as types from './types';
import * as actions from '../actions';
import {login} from '../lib/api/';
import { globalStore } from '../index';

export function showNotification() {

    return {
        type: types.MainShowNotification
    };

}

export function hideNotification() {
    
    return {
        type: types.MainHideNotification
    };

}