/** Base for all socket API  */

var path = require('path');
var _ = require('lodash');

var Const = require("../lib/consts");
var Utils = require("../lib/utils");

var UserModel = require('../Models/User');

var SocketHandlerBase = function(){
    
}

SocketHandlerBase.prototype.checkToken = function(token,callBack){
    
    if(_.isEmpty(token)){

        callBack(null);
        return;
    }
    
    var userModel = UserModel.get();
    
    userModel.findOne({"token.token":token},function(err,findResult){

        if(_.isEmpty(findResult)){

            callBack(null);
        
            return;
        }
        
        var tokenObj = _.find(findResult.token,function(tokenObjInAry){
            return tokenObjInAry.token == token;
        });
        
        var tokenGenerated = tokenObj.generateAt;
        
        var diff = Utils.now() - tokenGenerated;

        if(diff > Const.tokenValidInteval){

            callBack(null);
            return;
        }

        callBack(findResult);
        
    });
    
}

module["exports"] = SocketHandlerBase;