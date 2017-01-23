var _ = require('lodash');
var async = require('async');
var APIClientBase = require('./ApiClientBase');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var SignoutClient = function(){};

_.extend(SignoutClient.prototype,APIClientBase.prototype);

SignoutClient.prototype.send = function(success,error){

    this.postRequst("/user/signout",{

    },success,error);

}
    
// returns instance
module["exports"] = new SignoutClient();
