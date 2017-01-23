var Const = require('../consts');
var APIClientBase = require('./ApiClientBase');
var _ = require('lodash');
var Conf = require('../init');
var loginUserManager = require('../loginUserManager');

var UpdateHookClient = function(){};

_.extend(UpdateHookClient.prototype,APIClientBase.prototype);

UpdateHookClient.prototype.send = function(hookObj,success,err){
    
    if(hookObj.hookType == Const.hookTypeInbound){   
         
        this.postRequst("/hook/in/update",{
            hookId: hookObj._id,
            targetType: hookObj.targetType,
            targetId: hookObj.targetId
        },success,err);
        
    }

    if(hookObj.hookType == Const.hookTypeOutgoing){   
         
        this.postRequst("/hook/out/update",{
            hookId: hookObj._id,
            url: hookObj.url,
            targetType: hookObj.targetType,
            targetId: hookObj.targetId
        },success,err);
        
    }
    
}
    // returns instance
module["exports"] = new UpdateHookClient();