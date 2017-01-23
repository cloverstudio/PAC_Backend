var CONST = require('../consts');
var APIClientBase = require('./ApiClientBase');
var _ = require('lodash');
var Conf = require('../init');
var loginUserManager = require('../loginUserManager');

var GetDictionary = function(){};

_.extend(GetDictionary.prototype,APIClientBase.prototype);

GetDictionary.prototype.send = function(success,err){
    
    this.getRequst("/lang/get",success,err);
    
}
    // returns instance
module["exports"] = new GetDictionary();