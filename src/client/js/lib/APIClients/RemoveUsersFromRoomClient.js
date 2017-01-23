var CONST = require('../consts');
var APIClientBase = require('./ApiClientBase');
var _ = require('lodash');
var Conf = require('../init');
var loginUserManager = require('../loginUserManager');

var RemoveUsersFromRoomClient = function(){};

_.extend(RemoveUsersFromRoomClient.prototype,APIClientBase.prototype);

RemoveUsersFromRoomClient.prototype.send = function(roomId,users,success,err){
    
    this.postRequst("/room/users/remove",{
        roomId : roomId,
        users : users
    },success,err);
    
}
    // returns instance
module["exports"] = new RemoveUsersFromRoomClient();