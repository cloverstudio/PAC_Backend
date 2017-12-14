import sha1 from 'sha1';

import api from './api'; 
import * as config from '../config';
import * as constant from '../const';

import user from '../user';

export function callSearchMessage(keyword){
    
    return api.get(constant.ApiUrlSearchMessage + encodeURIComponent(keyword) + "/1")
    
    .then( (response) => {

        if (!response.code || response.code != 1){
            return Promise.reject("Failed to get messages");
        }
        else {
            return Promise.resolve(response.data);
        }
    });

}

export function callLoadFavorites(page){
    
    
    return api.get(constant.ApiUrlFavorites + "/" + page)
    
    .then( (response) => {

        if (!response.code || response.code != 1){
            return Promise.reject("Failed to load favorites");
        }
        else {
            return Promise.resolve(response.data);
        }
    });

}

export function callRemoveFromFavorite(messageId){

    return api.post(constant.ApiUrlRemoveFromFavorite,{
        messageId: messageId
    }).then( (response) => {
        return Promise.resolve(response.data);
    });

}

export function callAddToFavorite(messageId){

    return api.post(constant.ApiUrlAddToFavorite,{
        messageId
    })
    .then( (response) => {
        if (!response.code || response.code != 1){
            return Promise.reject("Failed to add to favorites");
        }
        else {
            return Promise.resolve(response.data);
        }
    });
}

export function callGetMessageInfo(messageId){

    return api.get(constant.ApiUrlGetMessageInfo + messageId)
    .then( response => {

        if (!response.code || response.code != 1){
            return Promise.reject("Failed to get message info");
        }
        else {
            return Promise.resolve(response.data);
        }
    })
}


