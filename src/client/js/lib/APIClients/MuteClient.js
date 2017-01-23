var CONST = require('../consts');
var APIClientBase = require('./ApiClientBase');
var _ = require('lodash');
var Conf = require('../init');
var loginUserManager = require('../loginUserManager');

var MuteClient = function(){};

_.extend(MuteClient.prototype,APIClientBase.prototype);

MuteClient.prototype.send = function(state,targetId,type,success,err){
    
    var action = 'mute';
    if(state == true)
        action = 'unmute';

    this.postRequst("/user/mute",{
        action: action,
        target: targetId,
        type: type
    },success,err);
    
}
    // returns instance
module["exports"] = new MuteClient();