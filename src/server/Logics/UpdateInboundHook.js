/**  Update inbound hook */

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

var UpdateInboundHook = {
    
    update: function(hookId,targetType,targetId,callBack){
        
        var hookModel = HookModel.get();
        var groupModel = GroupModel.get();
        var userModel = UserModel.get();
        var roomModel = RoomModel.get();
        
        if(!targetType){
            callBack(Const.responsecodeUpdateInboundHookWrongTargetType,null);
            return;
        }

        if(!targetId || !Utils.toObjectId(targetId)){
            callBack(Const.responsecodeUpdateInboundHookWrongTargetId,null);
            return;
        }
        
        if(!hookId || !Utils.toObjectId(hookId)){
            callBack(Const.responsecodeUpdateInboundHookWrongHookId,null);
            return; 
        }
        
        async.waterfall([function(done){
            
            var result = {};
            
            if(targetType == Const.chatTypePrivate){
                
                userModel.findOne({_id:targetId},function(err,findResult){
                    
                    if(!findResult){
                        callBack(Const.responsecodeUpdateInboundHookWrongTargetId,null);
                        return;
                    }
                    
                    result.target = findResult;
                    done(err,result);
                     
                });
                
            }

            else if(targetType == Const.chatTypeGroup){

                groupModel.findOne({_id:targetId},function(err,findResult){

                    if(!findResult){
                        callBack(Const.responsecodeUpdateInboundHookWrongTargetId,null);
                        return;
                    }
                    
                    result.target = findResult;
                    done(err,result);
                     
                });
                
            }

            else if(targetType == Const.chatTypeRoom){

                roomModel.findOne({_id:targetId},function(err,findResult){

                    if(!findResult){
                        callBack(Const.responsecodeUpdateInboundHookWrongTargetId,null);
                        return;
                    }
                    
                    result.target = findResult;
                    done(err,result);
                     
                });
                
            }
            
            else {
                callBack(Const.responsecodeUpdateInboundHookWrongTargetType,null);
                return;
            }
            
        },
        function(result,done){

            hookModel.findOne({_id:hookId},function(err,findResult){

                if(!findResult){
                    callBack(Const.responsecodeUpdateInboundHookWrongHookId,null);
                    return;
                }
                
                result.hook = findResult.toObject();
                done(err,result);
                    
            });

        },
        function(result,done){
            
            hookModel.update(
                { _id: hookId }, 
                { 
                    targetType: targetType,
                    targetId: targetId
                }, 
                { multi: false }, 
            function(err, updateResult) {

                 done(err, result);
                 
            });

        }
        ],
        function(err,result){
            
            if(err){
                console.log("critical err",err);
                callBack(Const.responsecodeUnknownError,null);
                return;
            }
            
            result.hook.targetType = targetType;
            result.hook.targetId = targetId;
            
            callBack(null,result.hook);
            
        });
        
    }
};


module["exports"] = UpdateInboundHook;