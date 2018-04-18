import sha1 from 'sha1';

import api from './api'; 
import * as config from '../config';
import * as constant from '../const';

export function callGetGroupList(page){

    return api.get(constant.ApiUrlGetGroupList + page).then( (response) => {

        if(!response.code || response.code != 1){
            return Promise.reject("Failed to get group list");
        }else{
            return Promise.resolve(response.data);
        }

    });
    
}

export function callSearchGroupList(value){

    return api.get(constant.ApiUrlSearchGroupList + '1?keyword=' + value)
    
    .then( (response) => {
        if (!response.code || response.code != 1){
            return Promise.reject("Failed to search group list");
        }
        else {
            return Promise.resolve(response.data);
        }
    });

}

export function callGroupUserList(groupId,page){

    return api.get(constant.ApiUrlGetGroupUserList + '/' + groupId + '/' + page)
    
    .then( (response) => {
        if (!response.code || response.code != 1){
            return Promise.reject("Failed to get user list");
        }
        else {
            return Promise.resolve(response.data);
        }
    });
    
}

