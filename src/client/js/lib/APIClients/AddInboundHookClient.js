var CONST = require('../consts');
var APIClientBase = require('./ApiClientBase');
var _ = require('lodash');
var Conf = require('../init');
var loginUserManager = require('../loginUserManager');

var AddInboundHookClient = function(){};

_.extend(AddInboundHookClient.prototype,APIClientBase.prototype);

AddInboundHookClient.prototype.send = function(targetType,targetId,success,err){
    
    this.postRequst("/hook/in/add",{
        targetType: targetType,
        targetId: targetId
    },success,err);
    
}
    // returns instance
module["exports"] = new AddInboundHookClient();