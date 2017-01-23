var Const = require('../consts');
var APIClientBase = require('./ApiClientBase');
var _ = require('lodash');
var Conf = require('../init');
var loginUserManager = require('../loginUserManager');

var DeleteHookClient = function(){};

_.extend(DeleteHookClient.prototype,APIClientBase.prototype);

DeleteHookClient.prototype.send = function(hookType,hookId,success,err){
    
    if(hookType == Const.hookTypeInbound){   
         
        this.postRequst("/hook/in/remove",{
            hookId: hookId
        },success,err);
        
    }

    if(hookType == Const.hookTypeOutgoing){   
         
        this.postRequst("/hook/out/remove",{
            hookId: hookId
        },success,err);
        
    }
    
}
    // returns instance
module["exports"] = new DeleteHookClient();