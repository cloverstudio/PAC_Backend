var JSON = require('JSON2');
var _ = require('lodash');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var APIClientBase = require('./ApiClientBase');

var MyRoomListClient = function(){};

_.extend(MyRoomListClient.prototype,APIClientBase.prototype);

MyRoomListClient.prototype.send = function(success,err){
            
    this.getRequst("/room/list/mine",success,err);
    
}
    
// returns instance
module["exports"] = new MyRoomListClient();