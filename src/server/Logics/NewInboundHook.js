/** Create new inbound hook */

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

var NewInboundHook = {
    
    create: function(userId,targetType,targetId,callBack){
        
        var hookModel = HookModel.get();
        var groupModel = GroupModel.get();
        var userModel = UserModel.get();
        var roomModel = RoomModel.get();
        
        if(!targetType){
            callBack(Const.responsecodeAddInboundHookWrongTargetType,null);
            return;
        }

        if(!targetId || !Utils.toObjectId(targetId)){
            callBack(Const.responsecodeAddInboundHookWrongTargetId,null);
            return;
        }
        
        if(!userId || !Utils.toObjectId(userId)){
            callBack(Const.responsecodeAddInboundHookWrongUserId,null);
            return; 
        }
        
        async.waterfall([function(done){
            
            var result = {};
            
            if(targetType == Const.chatTypePrivate){
                
                userModel.findOne({_id:targetId},function(err,findResult){
                    
                    if(!findResult){
                        callBack(Const.responsecodeAddInboundHookWrongTargetId,null);
                        return;
                    }
                    
                    result.target = findResult;
                    done(err,result);
                     
                });
                
            }

            else if(targetType == Const.chatTypeGroup){

                groupModel.findOne({_id:targetId},function(err,findResult){

                    if(!findResult){
                        callBack(Const.responsecodeAddInboundHookWrongTargetId,null);
                        return;
                    }
                    
                    result.target = findResult;
                    done(err,result);
                     
                });
                
            }

            else if(targetType == Const.chatTypeRoom){

                roomModel.findOne({_id:targetId},function(err,findResult){

                    if(!findResult){
                        callBack(Const.responsecodeAddInboundHookWrongTargetId,null);
                        return;
                    }
                    
                    result.target = findResult;
                    done(err,result);
                     
                });
                
            }
            
            else {
                callBack(Const.responsecodeAddInboundHookWrongTargetType,null);
                return;
            }
            
        },
        function(result,done){

            var newIdentifier = Utils.getRandomString(12);

            // save to database
            var model = new hookModel({
                userId:userId,
                identifier:newIdentifier,
                targetType: targetType,
                targetId: targetId,
                hookType: Const.hookTypeInbound,
                url: '',
                created: Utils.now()
            });

            model.save(function(err,hookModelResult){
                                
                if(err){
                    done(err,null);
                    return;
                }
                
                result.model = hookModelResult;

                done(null,result);

            });

        }
        ],
        function(err,result){
            
            if(err){
                console.log("critical err",err);
                callBack(Const.responsecodeUnknownError,null);
                return;
            }
            
            callBack(null,result.model);
            
        });
        
    }
};


module["exports"] = NewInboundHook;