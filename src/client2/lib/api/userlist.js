import sha1 from 'sha1';

import api from './api'; 
import * as config from '../config';
import * as constant from '../const';

export function callGetUserList(page){

    return api.get(constant.ApiUrlGetUserList + page).then( (response) => {

        if(!response.code || response.code != 1){
            return Promise.reject("Failed get user list");
        }else{
            return Promise.resolve(response.data);
        }

    });
    
}

export function callSearchUserList(value){

    return api.get(constant.ApiUrlSearchUserList + '1?keyword=' + value)
    
    .then( (response) => {
        if (!response.code || response.code != 1){
            return Promise.reject("Failed to search user list");
        }
        else {
            return Promise.resolve(response.data);
        }
            
    });
}