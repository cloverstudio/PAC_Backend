var JSON = require('JSON2');
var _ = require('lodash');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var APIClientBase = require('./ApiClientBase');

var UserListClient = function(){};

_.extend(UserListClient.prototype,APIClientBase.prototype);

UserListClient.prototype.send = function(page,success,err){
            
    this.getRequst("/user/list/" + page,success,err);
    
}
    
// returns instance
module["exports"] = new UserListClient();