import sha1 from 'sha1';

import api from './api'; 
import * as config from '../config';
import * as constant from '../const';

export function callGetUserDetail(userId){

    return api.get(`${constant.ApiUrlGetUserDetail}${userId}`).then( (response) => {

        if(!response.code || response.code != 1){
            return Promise.reject("Failed get user");
        }else{
            return Promise.resolve(response.data);
        }

    });
    
}

export function callGetGroupDetail(groupId){
    
    return api.get(`${constant.ApiUrlGetGroupDetail}${groupId}`).then( (response) => {

        if(!response.code || response.code != 1){
            return Promise.reject("Failed get group");
        }else{
            return Promise.resolve(response.data);
        }

    });
    
}

export function callGetRoomDetail(roomId){
    
    return api.get(`${constant.ApiUrlGetRoomDetail}${roomId}`).then( (response) => {

        if(!response.code || response.code != 1){
            return Promise.reject("Failed get room");
        }else{
            return Promise.resolve(response.data);
        }

    });
    
}
