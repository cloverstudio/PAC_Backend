var CONST = require('../consts');
var APIClientBase = require('./ApiClientBase');
var _ = require('lodash');
var Conf = require('../init');
var loginUserManager = require('../loginUserManager');

var AddToFavoriteClient = function(){};

_.extend(AddToFavoriteClient.prototype,APIClientBase.prototype);

AddToFavoriteClient.prototype.send = function(roomId,users,success,err){
    
    this.postRequst("/room/users/add",{
        roomId : roomId,
        users : users
    },success,err);
    
}
    // returns instance
module["exports"] = new AddToFavoriteClient();