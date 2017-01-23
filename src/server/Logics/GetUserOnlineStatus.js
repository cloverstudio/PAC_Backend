/** send list of user id and returns online status of these users */

var _ = require('lodash');
var async = require('async');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var Utils = require("../lib/utils");

var DatabaseManager = require("../lib/DatabaseManager");

var UserModel = require('../Models/User');
var RoomModel = require('../Models/Room');
var GroupModel = require('../Models/Group');
var HistoryModel = require('../Models/History');

var GetUserOnlineStatus = {
    
    get : function(userIds,callBack){
        
        var result = [];
        
        async.each(userIds,function(userId,done){
            
            DatabaseManager.redisGetValue(Const.redisKeyOnlineStatus + userId,function(err,redisResult){
                
                if(redisResult){
                    redisResult = 1;
                }else{
                    redisResult = 0;
                }
                
                result.push({
                    userId : userId,
                    onlineStatus : redisResult
                });
                
                done(err);
                
            });
            
        },function(err){
            
            callBack(err,result);

        });

        
    }
    
};


module["exports"] = GetUserOnlineStatus;