/** ping-ok Socket API  */

var _ = require('lodash');
var async = require('async');

var DatabaseManager = require("../lib/DatabaseManager");
var OnlineStatusChecker = require('../lib/OnlineStatusChecker');

var Utils = require("../lib/utils");
var Const = require("../lib/consts");
var Config = require("../lib/init");
var SocketHandlerBase = require("./SocketHandlerBase");

var GroupModel = require('../Models/Group');
var RoomModel = require('../Models/Room');
var UserModel = require('../Models/User');

var PongActionHandler = function(){
    
}

_.extend(PongActionHandler.prototype,SocketHandlerBase.prototype);

PongActionHandler.prototype.attach = function(io,socket){
        
    var self = this;

    /**
     * @api {socket} "pingok" ping ok
     * @apiName ping ok
     * @apiGroup Socket 
     * @apiDescription answer for ping request
     * @apiParam {string} userId userId

     */
    socket.on('pingok', function(param){
        
        if(!param.userId){
            socket.emit('socketerror', {code:Const.responsecodeSigninInvalidToken});
            return;
        }
        
        OnlineStatusChecker.addAnswer(socket.id)
          
    });

}


module["exports"] = new PongActionHandler();