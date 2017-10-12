var CONST = require('../consts');
var APIClientBase = require('./ApiClientBase');
var _ = require('lodash');
var Conf = require('../init');
var loginUserManager = require('../loginUserManager');

var MarkAllAsReadClient = function(){};

_.extend(MarkAllAsReadClient.prototype,APIClientBase.prototype);

MarkAllAsReadClient.prototype.send = function(chatId,chatTypesuccess,err){
    
    this.postRequst("/user/history/markchat",{
        chatId: chatId,
        chatType: chatType
    },success,err);
    
}
    // returns instance
module["exports"] = new MarkAllAsReadClient();