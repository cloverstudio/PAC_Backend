var CONST = require('../consts');
var APIClientBase = require('./ApiClientBase');
var _ = require('lodash');
var Conf = require('../init');
var loginUserManager = require('../loginUserManager');

var AddOutgoingHookClient = function(){};

_.extend(AddOutgoingHookClient.prototype,APIClientBase.prototype);

AddOutgoingHookClient.prototype.send = function(url,targetType,targetId,success,err){
    
    this.postRequst("/hook/out/add",{
        url: url,
        targetType: targetType,
        targetId: targetId
    },success,err);
    
}
    // returns instance
module["exports"] = new AddOutgoingHookClient();