var JSON = require('JSON2');
var _ = require('lodash');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var APIClientBase = require('./ApiClientBase');

var HookListClient = function(){};

_.extend(HookListClient.prototype,APIClientBase.prototype);

HookListClient.prototype.send = function(success,err){
            
    this.getRequst("/user/hooks",success,err);
    
}
    
// returns instance
module["exports"] = new HookListClient();