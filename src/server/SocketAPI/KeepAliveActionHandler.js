/** ping-ok Socket API  */

var _ = require('lodash');
var async = require('async');

var DatabaseManager = require("../lib/DatabaseManager");

var Utils = require("../lib/utils");
var Const = require("../lib/consts");
var Config = require("../lib/init");
var SocketHandlerBase = require("./SocketHandlerBase");

var GroupModel = require('../Models/Group');
var RoomModel = require('../Models/Room');
var UserModel = require('../Models/User');

var KeepAliveActionHandler = function(){
    
}

_.extend(KeepAliveActionHandler.prototype,SocketHandlerBase.prototype);

KeepAliveActionHandler.prototype.attach = function(io,socket){
        
    var self = this;

    /**
     * @api {socket} "keepalive" keepalive
     * @apiName keepalive
     * @apiGroup Socket 
     * @apiDescription set user online

     */
    socket.on('keepalive', function(param){
        
        // make user online

        if(param.userId)
            DatabaseManager.redisSaveValue(Const.redisKeyOnlineStatus + param.userId,Utils.now());
            
          
    });

}


module["exports"] = new KeepAliveActionHandler();