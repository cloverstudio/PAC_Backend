import sha1 from 'sha1';

import api from './api'; 
import * as config from '../config';
import * as constant from '../const';

export function callMute(state,targetId,targetType){

    let action = "mute";
    if(!state)
        action = "unmute";

    return api.post(constant.ApiUrlMute,{
        action: action,
        target: targetId,
        type: targetType
    }).then( (response) => {

        return Promise.resolve(response.data);

    });

}