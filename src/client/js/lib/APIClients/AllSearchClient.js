var JSON = require('JSON2');
var _ = require('lodash');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var APIClientBase = require('./ApiClientBase');

var AllSearchClient = function(){};

_.extend(AllSearchClient.prototype,APIClientBase.prototype);

AllSearchClient.prototype.send = function(keyword,page,success,err){
    
    keyword = encodeURI(keyword);
    
    this.getRequst("/search/all/" + page + "?keyword=" + keyword,success,err);
    
}
    
// returns instance
module["exports"] = new AllSearchClient();