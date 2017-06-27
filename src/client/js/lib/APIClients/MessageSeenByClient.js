var JSON = require('JSON2');
var _ = require('lodash');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var APIClientBase = require('./ApiClientBase');

var MessageSeenByClient = function(){};

_.extend(MessageSeenByClient.prototype,APIClientBase.prototype);

MessageSeenByClient.prototype.send = function(messageId,success,err){

    
    this.getRequst("/message/seenby/" + messageId,success,err);
    
}
    
// returns instance
module["exports"] = new MessageSeenByClient();