import sha1 from 'sha1';

import api from './api'; 
import * as config from '../config';
import * as constant from '../const';

export function callBlock(state,targetId){

    let action = "block";
    if(!state)
        action = "unblock";

    return api.post(constant.ApiUrlBlock,{
        action: action,
        target: targetId
    }).then( (response) => {

        return Promise.resolve(response.data);

    });

}