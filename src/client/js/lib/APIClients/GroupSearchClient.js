var JSON = require('JSON2');
var _ = require('lodash');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var APIClientBase = require('./ApiClientBase');

var GroupSearchClient = function(){};

_.extend(GroupSearchClient.prototype,APIClientBase.prototype);

GroupSearchClient.prototype.send = function(keyword,page,success,err){
    
    keyword = encodeURI(keyword);
    
    this.getRequst("/group/search/" + page + "?keyword=" + keyword,success,err);
    
}
    
// returns instance
module["exports"] = new GroupSearchClient();