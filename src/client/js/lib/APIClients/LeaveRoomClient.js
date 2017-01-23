var CONST = require('../consts');
var APIClientBase = require('./ApiClientBase');
var _ = require('lodash');
var Conf = require('../init');
var loginUserManager = require('../loginUserManager');

var LeaveRoomClient = function(){};

_.extend(LeaveRoomClient.prototype,APIClientBase.prototype);

LeaveRoomClient.prototype.send = function(roomId,success,err){
    
    this.postRequst("/room/leave/",{roomId:roomId},success,err);
    
}
    // returns instance
module["exports"] = new LeaveRoomClient();