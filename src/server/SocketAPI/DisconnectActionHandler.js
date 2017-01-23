/** disconnect Socket API  */

var _ = require('lodash');
var async = require('async');

var DatabaseManager = require("../lib/DatabaseManager");
var OnlineStatusChecker = require("../lib/OnlineStatusChecker");
var SocketConnectionHandler = require("../lib/SocketConnectionHandler");

var Utils = require("../lib/utils");
var Const = require("../lib/consts");
var Config = require("../lib/init");
var SocketHandlerBase = require("./SocketHandlerBase");

var DisconnectActionHandler = function(){
    
}

_.extend(DisconnectActionHandler.prototype,SocketHandlerBase.prototype);

DisconnectActionHandler.prototype.attach = function(io,socket){
        
    var self = this;

    /**
     * @api {socket} "disconnect" Disconnect
     * @apiName Disconnect
     * @apiGroup Socket 
     * @apiDescription Disconnect from socket
     */
    
    socket.on('disconnect', function(){
        
        DatabaseManager.redisGet(Const.redisKeySocketId + socket.id,function(err,userModel){

            if(err){
                socket.emit('socketerror', {code:Const.responsecodeUnknownError});
                return;
            }

            SocketConnectionHandler.deleteSocketId(socket.id,userModel);
            
        });
          
    });
    
}


module["exports"] = new DisconnectActionHandler();