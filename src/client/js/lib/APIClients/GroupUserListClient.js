var JSON = require('JSON2');
var _ = require('lodash');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var APIClientBase = require('./ApiClientBase');

var GroupUserListClient = function(){};

_.extend(GroupUserListClient.prototype,APIClientBase.prototype);

GroupUserListClient.prototype.send = function(groupId,page,success,err){
            
    this.getRequst("/group/users/" + groupId + "/" + page,success,err);
    
}
    
// returns instance
module["exports"] = new GroupUserListClient();