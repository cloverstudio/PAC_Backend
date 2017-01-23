/** Called from HoolListControllers.js  */

var _ = require('lodash');
var async = require('async');
var apn = require('apn');
var gcm = require('node-gcm');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var Utils = require("../lib/utils");

var DatabaseManager = require('../lib/DatabaseManager');

var UserModel = require('../Models/User');
var RoomModel = require('../Models/Room');
var GroupModel = require('../Models/Group');
var HookModel = require('../Models/Hook');

var GetChatTargetModels = {
    
    get: function(paramAry,callBack){
        
        async.waterfall([function(done){
            
            var result = {};
            
            // get users
            var userIds = _.map(paramAry,function(param){
                if(param.type == Const.chatTypePrivate);
                    return param.id;
            });
            
            var model = UserModel.get();
            
            model.find({
                _id: {$in : userIds }
            },function(err,findResult){
                
                result.users = findResult;
                
                done(err,result);
                
            });
        
        },
        function(result,done){

            // get groups
            var groupIds = _.map(paramAry,function(param){
                if(param.type == Const.chatTypeGroup);
                    return param.id;
            });
            
            var model = GroupModel.get();
            
            model.find({
                _id: {$in : groupIds }
            },function(err,findResult){
                
                result.groups = findResult;
                
                done(err,result);

            });
        },
        function(result,done){

            // get rooms
            var roomIds = _.map(paramAry,function(param){
                if(param.type == Const.chatTypeRoom);
                    return param.id;
            });
            
            var model = RoomModel.get();
            
            model.find({
                _id: {$in : roomIds }
            },function(err,findResult){
                
                result.rooms = findResult;
                
                done(err,result);

            });
            
        }
        ],
        function(err,result){
            
            callBack(err,result);
            
        });
        
    }
    
};


module["exports"] = GetChatTargetModels;