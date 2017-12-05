

import * as config from './config';
import * as constant from './const';
import user from './user';

export function chatIdByUser(targetUser){
    
    let chatId = "";
    let user1 = user.userData;
    let user2 = targetUser;

    if(user1.created < user2.created){
        
        chatId = constant.ChatTypePrivate + "-" + user1._id + "-" + user2._id;
        
    } else {
        
        chatId = constant.ChatTypePrivate + "-" + user2._id + "-" + user1._id;
        
    }
    
    return chatId;
    
}

export function chatIdByGroup(group){
    return constant.ChatTypeGroup + "-" + group._id;
}

export function chatIdByRoom(room){
    return constant.ChatTypeRoom + "-" + room._id;
}

export function getChatIdFromUrl(url){

    if(url)
        return url.replace(config.BasePath + '/chat/','');

    return url;
}

export function getRandomString(length){

    if(length == undefined)
        length = 32;
        
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

export function scrollElemBottom(element){
    if (element.scrollHeight > element.clientHeight){
        element.scrollTop = element.scrollHeight - element.clientHeight
    }
}

export function url(url){
    return config.BasePath + url;
}