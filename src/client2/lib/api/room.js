import sha1 from 'sha1';

import api from './api'; 
import * as config from '../config';
import * as constant from '../const';

import user from '../user';

export function callCreateRoom(
    users,
    name,
    description,
    file){

    const data = new FormData();
    let userIds = users.map( (user) => { return user._id }).join(',');

    data.append('users',userIds);
    data.append('name',name);
    data.append('description',description);
    data.append('file', file);
                            
    const headers = {
    }

    if(user.token){
        headers['access-token'] = user.token;
    }

    return fetch(config.APIEndpoint + constant.ApiUrlCreateRoom, 
    {   
        method: 'POST', 
        body: data,
        mode: 'cors',
        headers:headers
    })
    .then((res) => {
        
        if(res.status == 200){
            return res.json();
        }else{
            return res.text();
        }

    }).then((response) => {

        return Promise.resolve(response.data.room);

    });
    
}

export function callUpdateRoom(
    roomId,
    name,
    description,
    file){

    const data = new FormData();

    data.append('roomId',roomId);
    data.append('name',name);
    data.append('description',description);

    if(file)
        data.append('file', file);
                            
    const headers = {
    }

    if(user.token){
        headers['access-token'] = user.token;
    }

    return fetch(config.APIEndpoint + constant.ApiUrlUpdateRoom, 
    {   
        method: 'POST', 
        body: data,
        mode: 'cors',
        headers:headers
    })
    .then((res) => {
        
        if(res.status == 200){
            return res.json();
        }else{
            return res.text();
        }

    }).then((response) => {

        return Promise.resolve(response.data.room);

    });
    
}


export function callRoomUserList(roomId,page){

    return api.get(constant.ApiUrlGetRoomUserList + roomId + '/' + page)
    
    .then( (response) => {

        if (!response.code || response.code != 1){
            return Promise.reject("Failed to get user list");
        }
        else {
            return Promise.resolve(response.data);
        }
    });
    
}


export function callGetRoomDetail(roomId){

    return api.get(constant.ApiUrlGetRoomDetail + roomId + '/' + page)
    
    .then( (response) => {

        if (!response.code || response.code != 1){
            return Promise.reject("Failed to get room detail");
        }
        else {
            return Promise.resolve(response.data);
        }
    });
    
}


export function callAddMemberToRoom(roomId,userIds){

    return api.post(constant.ApiUrlAddUserToRoom,{
        roomId:roomId,
        users:userIds
    })
    .then( (response) => {

        if (!response.code || response.code != 1){
            return Promise.reject("Failed to add users.");
        }
        else {
            return Promise.resolve(response.data);
        }
    });
    
}


export function ApiUrlRemoveUserFromRoom(roomId,userIds){

    return api.post(constant.ApiUrlRemoveUserFromRoom,{
        roomId:roomId,
        users:userIds
    })
    .then( (response) => {

        if (!response.code || response.code != 1){
            return Promise.reject("Failed to remove users.");
        }
        else {
            return Promise.resolve(response.data);
        }
    });
    
}

