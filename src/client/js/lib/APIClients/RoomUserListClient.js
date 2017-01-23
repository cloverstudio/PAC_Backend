var JSON = require('JSON2');
var _ = require('lodash');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var APIClientBase = require('./ApiClientBase');

var RoomUserListClient = function(){};

_.extend(RoomUserListClient.prototype,APIClientBase.prototype);

RoomUserListClient.prototype.send = function(roomId,page,success,err){
            
    this.getRequst("/room/users/" + roomId + "/" + page,success,err);
    
}
    
// returns instance
module["exports"] = new RoomUserListClient();