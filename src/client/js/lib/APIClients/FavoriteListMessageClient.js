var JSON = require('JSON2');
var _ = require('lodash');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var APIClientBase = require('./ApiClientBase');

var FavoriteListMessageClient = function(){};

_.extend(FavoriteListMessageClient.prototype,APIClientBase.prototype);

FavoriteListMessageClient.prototype.send = function(page,success,err){
    
    this.getRequst("/message/favorite/list/" + page,success,err);
    
}
    
// returns instance
module["exports"] = new FavoriteListMessageClient();