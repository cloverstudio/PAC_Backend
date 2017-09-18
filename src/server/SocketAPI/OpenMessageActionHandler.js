/** ping-ok Socket API  */

var _ = require('lodash');
var async = require('async');

var DatabaseManager = require("../lib/DatabaseManager");

var Utils = require("../lib/utils");
var Const = require("../lib/consts");
var Config = require("../lib/init");
var SocketHandlerBase = require("./SocketHandlerBase");
var SocketAPIHandler = require("./SocketAPIHandler");

var GroupModel = require('../Models/Group');
var RoomModel = require('../Models/Room');
var UserModel = require('../Models/User');

var MessageModel = require('../Models/Message');

var OpenMessageActionHandler = function(){
    
}

_.extend(OpenMessageActionHandler.prototype,SocketHandlerBase.prototype);

OpenMessageActionHandler.prototype.attach = function(io,socket){
        
    var self = this;

    /**
     * @api {socket} "openMessage" open unread message
     * @apiName openMessage
     * @apiGroup Socket 
     * @apiDescription set user online

     */
    socket.on('openMessage', function(param){
        
        if(!param.messageID){
            socket.emit('socketerror', {code:Const.resCodeSocketOpenMessageWrongMessageID}); 
            return;
        }

        if(!param.userID){
            socket.emit('socketerror', {code:Const.resCodeSocketOpenMessageNoUserId});
            return;
        }

        var messageModel = MessageModel.get();

        async.waterfall([(done) => {

            var result = {};

            messageModel.findOne({
                _id: param.messageID
            },(err,findResult) => {

                result.message = findResult;

                // do nothing for message sent user
                if(findResult.userID == param.userID){
                    return;
                }

                done(err,result);

            });
            
        },
        (result,done) => {

            var seenByRow = { 
                        user:param.userID,
                        at:Utils.now(),
                        version:2
                    }   ;

            messageModel.update({ 
                _id: param.messageID
            },{ 
                $push: { seenBy: seenByRow   
                } 
            },(err,updateResult) => {


            });

            result.message.seenBy.push(seenByRow);

            done(null,result);

        },
        (result,done) => {

            MessageModel.populateMessages([result.message],function (err,data) {
                
                done(err,data[0]);

            });

        },
        (message,done) => {

            done(null,message);

        }],

        (err,message) => {

            if(err){
                socket.emit('socketerror', {code:Const.resCodeSocketUnknownError});  
                return;
            }

            var chatType = message.roomID.split("-")[0];

            // websocket notification
            if(chatType == Const.chatTypeGroup){
                
                SocketAPIHandler.emitToRoom(message.roomID,'updatemessages',[message]);
                
            } else if(chatType == Const.chatTypeRoom) {
                
                SocketAPIHandler.emitToRoom(message.roomID,'updatemessages',[message]);

            } else if(chatType == Const.chatTypePrivate){
                
                var splitAry = message.roomID.split("-");
                
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

                // send to myself
                DatabaseManager.redisGet(Const.redisKeyUserId + fromUser,function(err,redisResult){
                    
                    var socketIds = _.pluck(redisResult,"socketId");
                    
                    if(!_.isArray(redisResult))
                        return;
                    
                    _.forEach(redisResult,function(socketIdObj){
                        SocketAPIHandler.emitToSocket(socketIdObj.socketId,'updatemessages',[message]);
                    })

                });

                // send to user who got message
                DatabaseManager.redisGet(Const.redisKeyUserId + toUser,function(err,redisResult){
                    
                    var socketIds = _.pluck(redisResult,"socketId");
                    
                    if(!_.isArray(redisResult))
                        return;
                    
                    _.forEach(redisResult,function(socketIdObj){
                        SocketAPIHandler.emitToSocket(socketIdObj.socketId,'updatemessages',[message]);
                    })

                });

            }
            
            

        });

    });

}

module["exports"] = new OpenMessageActionHandler();