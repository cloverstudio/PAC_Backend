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
    // returns instance
module["exports"] = new MarkChatAsReadClient();