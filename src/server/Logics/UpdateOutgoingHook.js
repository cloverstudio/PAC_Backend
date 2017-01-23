/**  Update out going hook */

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

var UpdateOutgoingHook = {
    
    update: function(hookId,url,targetType,targetId,callBack){

        var hookModel = HookModel.get();
        var groupModel = GroupModel.get();
        var userModel = UserModel.get();
        var roomModel = RoomModel.get();
        
        if(!url){
            callBack(Const.responsecodeUpdateOutgoingHookWrongURL,null);
            return;
        }

        if(!hookId || !Utils.toObjectId(hookId)){
            callBack(Const.responsecodeUpdateOutgoingHookWrongHookId,null);
            return; 
        }

        if(!targetType){
            callBack(Const.responsecodeUpdateOutgoingHookWrongTargetType,null);
            return;
        }

        if(!targetId || !Utils.toObjectId(targetId)){
            callBack(Const.responsecodeUpdateOutgoingHookWrongTargetId,null);
            return;
        }
        
        async.waterfall([function(done){
            
            var result = {};
            
            if(targetType == Const.chatTypePrivate){
                
                userModel.findOne({_id:targetId},function(err,findResult){
                    
                    if(!findResult){
                        callBack(Const.responsecodeUpdateOutgoingHookWrongTargetId,null);
                        return;
                    }
                    
                    result.target = findResult;
                    done(err,result);
                     
                });
                
            }

            else if(targetType == Const.chatTypeGroup){

                groupModel.findOne({_id:targetId},function(err,findResult){

                    if(!findResult){
                        callBack(Const.responsecodeUpdateOutgoingHookWrongTargetId,null);
                        return;
                    }
                    
                    result.target = findResult;
                    done(err,result);
                     
                });
                
            }

            else if(targetType == Const.chatTypeRoom){

                roomModel.findOne({_id:targetId},function(err,findResult){

                    if(!findResult){
                        callBack(Const.responsecodeUpdateOutgoingHookWrongTargetId,null);
                        return;
                    }
                    
                    result.target = findResult;
                    done(err,result);
                     
                });
                
            }
            
            else {
                callBack(Const.responsecodeUpdateOutgoingHookWrongTargetType,null);
                return;
            }
            
        },
        function(result,done){

            hookModel.findOne({_id:hookId},function(err,findResult){

                if(!findResult){
                    callBack(Const.responsecodeUpdateOutgoingHookWrongHookId,null);
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
                    url: url,
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
            
            result.hook.url = url;
            
            callBack(null,result.hook);
            
        });
        
    }
};


module["exports"] = UpdateOutgoingHook;