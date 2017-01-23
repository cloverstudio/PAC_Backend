var JSON = require('JSON2');
var _ = require('lodash');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var APIClientBase = require('./ApiClientBase');

var SearchMessageClient = function(){};

_.extend(SearchMessageClient.prototype,APIClientBase.prototype);

SearchMessageClient.prototype.send = function(keyword,page,success,err){
    
    this.getRequst("/message/search/" + encodeURIComponent(keyword) + "/" + page,success,err);
    
}
    
// returns instance
module["exports"] = new SearchMessageClient();