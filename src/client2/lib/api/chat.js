import sha1 from 'sha1';

import api from './api'; 
import * as config from '../config';
import * as constant from '../const';

export function callGetMessageList(chatId,lastMessageId,direction){

    return api.get(constant.ApiUrlMessageList + chatId+ "/" + lastMessageId + "/" + direction).then( (response) => {

        if(!response.code || response.code != 1){
            return Promise.reject("Failed get messages");
        }else{
            return Promise.resolve(response.data);
        }

    });
    
}
