import api from './api'; 
import * as config from '../config';
import * as constant from '../const';
import user from '../user';

export function callUpdateProfile(
    name,
    description,
    file){

    const data = new FormData();

    data.append('name',name);
    data.append('description',description);
    data.append('file', file);
                            
    const headers = {
    }

    if(user.token){
        headers['access-token'] = user.token;
    }

    return fetch(config.APIEndpoint + constant.ApiUrlUpdateProfile, 
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

        return Promise.resolve(response.data.user);

    });
    
}

export function updatePassword(currentPassword,newPassword){

    return api.post(constant.ApiUrlUpdatePassword,{
        currentPassword: currentPassword,
        newPassword: newPassword
    }).then( (response) => {

        return Promise.resolve(response.data);

    });

}
