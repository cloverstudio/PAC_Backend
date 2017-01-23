var JSON = require('JSON2');
var _ = require('lodash');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var APIClientBase = require('./ApiClientBase');

var GroupListClient = function(){};

_.extend(GroupListClient.prototype,APIClientBase.prototype);

GroupListClient.prototype.send = function(page,success,err){
            
    this.getRequst("/group/list/" + page,success,err);
    
}
    
// returns instance
module["exports"] = new GroupListClient();