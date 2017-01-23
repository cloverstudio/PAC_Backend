var CONST = require('../consts');
var APIClientBase = require('./ApiClientBase');
var _ = require('lodash');
var Conf = require('../init');
var loginUserManager = require('../loginUserManager');

var AddToFavoriteClient = function(){};

_.extend(AddToFavoriteClient.prototype,APIClientBase.prototype);

AddToFavoriteClient.prototype.send = function(messageId,success,err){
    
    this.postRequst("/message/favorite/remove",{
        messageId : messageId
    },success,err);
    
}
    // returns instance
module["exports"] = new AddToFavoriteClient();