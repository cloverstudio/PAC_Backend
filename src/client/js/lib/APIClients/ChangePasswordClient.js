var CONST = require('../consts');
var APIClientBase = require('./ApiClientBase');
var _ = require('lodash');
var Conf = require('../init');
var loginUserManager = require('../loginUserManager');

var ChangePasswordClient = function(){};

_.extend(ChangePasswordClient.prototype,APIClientBase.prototype);

ChangePasswordClient.prototype.send = function(data,success,err){
    
    this.postRequst("/user/updatepassword",data,success,err);
    
}
    // returns instance
module["exports"] = new ChangePasswordClient();