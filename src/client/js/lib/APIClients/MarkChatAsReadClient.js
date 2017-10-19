var CONST = require('../consts');
var APIClientBase = require('./ApiClientBase');
var _ = require('lodash');
var Conf = require('../init');
var loginUserManager = require('../loginUserManager');

var MarkChatAsReadClient = function(){};

_.extend(MarkChatAsReadClient.prototype,APIClientBase.prototype);

MarkChatAsReadClient.prototype.send = function(chatId,chatType,success,err){
    
    this.postRequst("/user/history/markchat",{
        chatId: chatId,
        chatType: chatType
    },success,err);
    
}

MarkChatAsReadClient.prototype.updateByMessage = function(message){

    console.log('message',message);

    var roomIDSplit = message.roomID.split('-');
    if(roomIDSplit.length < 1)
        return;

    var chatType = roomIDSplit[0];
    var chatId = "";
    if(chatType == CONST.chatTypeGroup || chatType == CONST.chatTypeRoom)
        chatId = roomIDSplit[1];

    if(chatType == CONST.chatTypePrivate)
        chatId = message.userID;

    this.send(chatId,chatType);


}

// returns instance
module["exports"] = new MarkChatAsReadClient();