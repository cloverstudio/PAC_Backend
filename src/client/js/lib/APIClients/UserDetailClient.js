var JSON = require('JSON2');
var _ = require('lodash');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var APIClientBase = require('./ApiClientBase');

var UserDetailClient = function(){};

_.extend(UserDetailClient.prototype,APIClientBase.prototype);

UserDetailClient.prototype.send = function(userId,success,err){
            
    this.getRequst("/user/detail/" + userId,success,err);
    
}
    
// returns instance
module["exports"] = new UserDetailClient();