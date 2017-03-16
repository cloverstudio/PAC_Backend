/** send list of user id and returns online status of these users */

var _ = require('lodash');
var async = require('async');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var Utils = require("../lib/utils");

var DatabaseManager = require("../lib/DatabaseManager");
var SocketAPIHandler = require("../SocketAPI/SocketAPIHandler");

var UserModel = require('../Models/User');
var RoomModel = require('../Models/Room');
var GroupModel = require('../Models/Group');
var HistoryModel = require('../Models/History');

var GetUserOnlineStatus = {
    
    get : function(userIds,callBack){
        
        var result = [];
        
        async.each(userIds,function(userId,done){
            
            DatabaseManager.redisGet(Const.redisKeyUserId + userId,function(err,redisResult){

                if(redisResult){

                    var onlinestatus = 0;

                    async.each(redisResult,function(socketInfo,done2){

                        var socketId = socketInfo.socketId;

                        SocketAPIHandler.emitToSocket(socketId,"spikaping",{});

                        SocketAPIHandler.temporaryListener(socketId,'pingok',2000,(param) => {

                            if(param){
                                // got pintok. so this user is online
                                onlinestatus = 1;

                                // send err to forece quit all
                                done2(1);
                            }else{
                                done2(null);
                            }
                            
                        });

                    },function(err){

                        console.log(" sent ping"," all done ");

                        result.push({
                            userId : userId,
                            onlineStatus : onlinestatus
                        });

                        done(err);

                    });

                }else{

                    result.push({
                        userId : userId,
                        onlineStatus : 0
                    });

                    done(err);

                }

            });
            

        },function(err){
            
            callBack(err,result);

        });

        
    }
    
};


module["exports"] = GetUserOnlineStatus;