/** Handles all notification for new nessaage, socket and push */

var _ = require('lodash');
var async = require('async');
var request = require('request');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var Utils = require("../lib/utils");

var DatabaseManager = require('../lib/DatabaseManager');
var EncryptionManager = require('../lib/EncryptionManager');
var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');

var PolulateMessageLogic = require('./PolulateMessage');
var TotalUnreadCount = require('./TotalUnreadCount');
var PushNotificationSender = require('./PushNotificationSender');

var HookModel = require('../Models/Hook');
var UserModel = require('../Models/User');
var RoomModel = require('../Models/Room');
var GroupModel = require('../Models/Group');
var HistoryModel = require('../Models/History');

var NotifyUpdateMessage = {
    
    notify: function(obj){

        var chatType = obj.roomID.split("-")[0];
        var roomIDSplitted = obj.roomID.split("-");
        
        if(roomIDSplitted.length < 2)
            return;
       
        async.waterfall([
            
            function(done){
                
                // websocket notification
                if(chatType == Const.chatTypeGroup){
                    
                    SocketAPIHandler.emitToRoom(obj.roomID,'updatemessages',[obj]);
                    
                    done(null,{});
                    
                } else if(chatType == Const.chatTypeRoom) {
                    
                    SocketAPIHandler.emitToRoom(obj.roomID,'updatemessages',[obj]);
                    
                    done(null,{});
                    
                } else if(chatType == Const.chatTypePrivate){
                    
                    var splitAry = obj.roomID.split("-");
                    
                    if(splitAry.length < 2)
                        return;
                    
                    var user1 = splitAry[1];
                    var user2 = splitAry[2];
                    
                    var toUser = null;
                    var fromUser = null;

                    if(user1 == obj.userID){
                        toUser = user2;
                        fromUser = user1;
                    }else{
                        toUser = user1;
                        fromUser = user2;
                    }

                    var sendNotification = true;

                    result.toUserId = toUser;

                    var userModel = UserModel.get();

                    userModel.find({
                        _id:result.toUserId
                    },function(err,findUserResult){
                        
                        result.users = findUserResult;

                        if(!findUserResult)
                            return;

                        var toUserObj = result.users[0].toObject();

                        if(result.sender && _.isArray(toUserObj.muted)){
                            
                            if(toUserObj.muted.indexOf(result.sender._id.toString()) != -1)
                                sendNotification = false;

                        }

                        // send to my self
                        DatabaseManager.redisGet(Const.redisKeyUserId + fromUser,function(err,redisResult){
                            
                            var socketIds = _.pluck(redisResult,"socketId");
                            
                            if(!_.isArray(redisResult))
                                return;
                            
                            _.forEach(redisResult,function(socketIdObj){
                                SocketAPIHandler.emitToSocket(socketIdObj.socketId,'updatemessages',[obj]);
                            })
                            
                        });

                        if(sendNotification) {

                            // send to user who got message
                            DatabaseManager.redisGet(Const.redisKeyUserId + toUser,function(err,redisResult){
                                
                                var socketIds = _.pluck(redisResult,"socketId");
                                
                                if(!_.isArray(redisResult))
                                    return;
                                
                                _.forEach(redisResult,function(socketIdObj){
                                    SocketAPIHandler.emitToSocket(socketIdObj.socketId,'updatemessages',[obj]);
                                })

                            });

                        }
                        
                        done(null,result);
                        
                    });

                }

            },
            
        ],
            
        function(err,result){

            if(err)
                return;
                

        });

        
    }
    
};


module["exports"] = NotifyUpdateMessage;