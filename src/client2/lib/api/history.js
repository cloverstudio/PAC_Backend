import sha1 from 'sha1';

import api from './api'; 
import * as config from '../config';
import * as constant from '../const';

export function callGetHistory(page){

    return api.get(constant.ApiUrlGetHistory + page).then( (response) => {

        if(!response.code || response.code != 1){
            return Promise.reject("Failed get history");
        }else{
            return Promise.resolve(response.data);
        }

    });
    
}