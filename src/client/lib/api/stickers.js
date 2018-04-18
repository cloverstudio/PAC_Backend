import sha1 from 'sha1';

import api from './api'; 
import * as config from '../config';
import * as constant from '../const';

export function callGetStickers(){
    
    return api.get(constant.ApiUrlGetStickers).then( (response) => {
        if (!response.code || response.code != 1){
            return Promise.reject("Failed to get stickers");
        }
        else{
            return Promise.resolve(response.data);
        }
    });
}