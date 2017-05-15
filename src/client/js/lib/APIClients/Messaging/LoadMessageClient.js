var JSON = require('JSON2');
var _ = require('lodash');

var Const = require('../../consts');
var Config = require('../../init');
var Utils = require('../../utils');

var APIClientBase = require('../ApiClientBase');

var LoadMessageClient = function(){};

_.extend(LoadMessageClient.prototype,APIClientBase.prototype);

LoadMessageClient.prototype.send = function(roomID,lastMessageId,success,err){

    this.getRequst("/message/list/" + roomID + "/" + lastMessageId,success,err);
    
}
    
// returns instance
module["exports"] = new LoadMessageClient();