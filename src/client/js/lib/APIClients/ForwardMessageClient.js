var CONST = require('../consts');
var APIClientBase = require('./ApiClientBase');
var _ = require('lodash');
var Conf = require('../init');
var loginUserManager = require('../loginUserManager');

var ForwardMessageClient = function(){};

_.extend(ForwardMessageClient.prototype,APIClientBase.prototype);

ForwardMessageClient.prototype.send = function(messageId,roomId,success,err){
    
    this.postRequst("/message/forward",{
        roomId : roomId,
        messageId : messageId
    },success,err);
    
}
    // returns instance
module["exports"] = new ForwardMessageClient();