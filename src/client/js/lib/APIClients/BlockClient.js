var CONST = require('../consts');
var APIClientBase = require('./ApiClientBase');
var _ = require('lodash');
var Conf = require('../init');
var loginUserManager = require('../loginUserManager');

var BlockClient = function(){};

_.extend(BlockClient.prototype,APIClientBase.prototype);

BlockClient.prototype.send = function(state,targetId,success,err){
    
    var action = 'block';
    if(state == true)
        action = 'unblock';

    this.postRequst("/user/block",{
        action: action,
        target: targetId
    },success,err);
    
}
    // returns instance
module["exports"] = new BlockClient();