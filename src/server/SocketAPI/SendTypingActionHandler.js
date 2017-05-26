
var _ = require('lodash');
var async = require('async');

var DatabaseManager = require("../lib/DatabaseManager");

var Utils = require("../lib/utils");
var Const = require("../lib/consts");
var Config = require("../lib/init");
var SocketHandlerBase = require("./SocketHandlerBase");

var UserModel = require("../Models/User");
var MessageModel = require("../Models/Message");

var SendMessageLogic = require("../Logics/SendMessage");

var SocketAPIHandler = require('./SocketAPIHandler');

var SendTypingActionHandler = function(){
    
}

_.extend(SendTypingActionHandler.prototype,SocketHandlerBase.prototype);

SendTypingActionHandler.prototype.attach = function(io,socket){
        
    var self = this;

    /**
     * @api {socket} "sendTyping" Send typing notification
     * @apiName Typing Notification
     * @apiGroup Socket 
     * @apiDescription Send typing notification

     * @apiParam {string} userID User ID
     * @apiParam {string} roomID Room ID
     * @apiParam {string} type 0: Remove typing notificaiton 1: Show typing notification
     *
     */
     
    socket.on('sendtyping', function(param){

        if(!param.userID){
            socket.emit('socketerror', {code:Const.resCodeSocketTypingNoUserID});
            return;
        }
        
        if(!param.roomID){
            socket.emit('socketerror', {code:Const.resCodeSocketTypingNoRoomID});
            return;
        }
        
        if(param.type === undefined){
            socket.emit('socketerror', {code:Const.resCodeSocketTypingNoType});
            return;
        }

        var userModel = UserModel.get();

        var roomID = param.roomID;
        var chatType = param.roomID.split("-")[0];
        var roomIDSplitted = param.roomID.split("-");

        async.waterfall([
            
            function(done){

                var result = {};

                done(null,result);

            },
            function(result,done){

                // websocket notification
                if(chatType == Const.chatTypeGroup){
                    
                    SocketAPIHandler.emitToRoom(roomID,'typing',param);
                    
                } else if(chatType == Const.chatTypeRoom) {
                    
                    SocketAPIHandler.emitToRoom(roomID,'typing',param);

                } else if(chatType == Const.chatTypePrivate){
                    
                    var splitAry = roomID.split("-");
                    
                    if(splitAry.length < 2)
                        return;
                    
                    var user1 = splitAry[1];
                    var user2 = splitAry[2];
                    
                    var toUser = null;
                    var fromUser = null;

                    if(user1 == param.userID){
                        toUser = user2;
                        fromUser = user1;
                    }else{
                        toUser = user1;
                        fromUser = user2;
                    }

                    // send to user who got message
                    DatabaseManager.redisGet(Const.redisKeyUserId + toUser,function(err,redisResult){
                        
                        var socketIds = _.pluck(redisResult,"socketId");
                        
                        if(!_.isArray(redisResult))
                            return;
                        
                        _.forEach(redisResult,function(socketIdObj){
                            SocketAPIHandler.emitToSocket(socketIdObj.socketId,'typing',param);
                        })

                        done(null,result);

                    });

                }

            },
            function(result,done){
                done(null,result);
            },
            function(result,done){
                done(null,result);
            },
            function(result,done){
                done(null,result);
            },
            function(result,done){
                done(null,result);
            }
        ],
        function(err,result){

            if(err)
                return;

        });
        
    });

}


module["exports"] = new SendTypingActionHandler();