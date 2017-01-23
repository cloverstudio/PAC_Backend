var JSON = require('JSON2');
var _ = require('lodash');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var APIClientBase = require('./ApiClientBase');

var UserSearchClient = function(){};

_.extend(UserSearchClient.prototype,APIClientBase.prototype);

UserSearchClient.prototype.send = function(keyword,page,success,err){
    
    keyword = encodeURI(keyword);
    
    this.getRequst("/user/search/" + page + "?keyword=" + keyword,success,err);
    
}
    
// returns instance
module["exports"] = new UserSearchClient();