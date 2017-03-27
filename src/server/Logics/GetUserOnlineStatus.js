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

            DatabaseManager.redisGet(Const.redisKeyOnlineStatus + userId,function(err,redisResult){

                if(redisResult){

                    result.push({
                        userId : userId,
                        onlineStatus : 1
                    });

                } else {

                    result.push({
                        userId : userId,
                        onlineStatus : redisResult
                    });

                }

                done();

            });

        },function(err){
            
            if(err == 1)
                err = null;
                
            callBack(err,result);

        });

        
    }
    
};


module["exports"] = GetUserOnlineStatus;