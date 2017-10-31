import * as types from './types';
import * as actions from '../actions';
import {login} from '../lib/api/';
import { globalStore } from '../index';

export function showToast(message) {

    setTimeout(()=>{
        globalStore.dispatch(hideToast());
    },2000);

    return {
        type: types.ToastShow,
        message
    };

}

export function hideToast() {
    return {
        type: types.ToastHide
    };
}
