import sha1 from 'sha1';

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
