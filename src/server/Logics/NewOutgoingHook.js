/** Create new out going hook */

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

var NewOutgoingHook = {
    
    create: function(userId,url,targetType,targetId,callBack){
        
        var hookModel = HookModel.get();
        var groupModel = GroupModel.get();
        var userModel = UserModel.get();
        var roomModel = RoomModel.get();
        
        if(!url){
            callBack(Const.responsecodeAddOutgoingHookWrongURL,null);
            return;
        }

        if(!targetType){
            callBack(Const.responsecodeAddOutgoingHookWrongTargetType,null);
            return;
        }

        if(!targetId || !Utils.toObjectId(targetId)){
            callBack(Const.responsecodeAddOutgoingHookWrongTargetId,null);
            return;
        }
        
        if(!userId || !Utils.toObjectId(userId)){
            callBack(Const.responsecodeAddOutgoingHookWrongUserId,null);
            return; 
        }
        
        async.waterfall([function(done){
            
            var result = {};

            var result = {};
            
            if(targetType == Const.chatTypePrivate){
                
                userModel.findOne({_id:targetId},function(err,findResult){
                    
                    if(!findResult){
                        callBack(Const.responsecodeAddOutgoingHookWrongTargetId,null);
                        return;
                    }
                    
                    result.target = findResult;
                    done(err,result);
                     
                });
                
            }

            else if(targetType == Const.chatTypeGroup){

                groupModel.findOne({_id:targetId},function(err,findResult){

                    if(!findResult){
                        callBack(Const.responsecodeAddOutgoingHookWrongTargetId,null);
                        return;
                    }
                    
                    result.target = findResult;
                    done(err,result);
                     
                });
                
            }

            else if(targetType == Const.chatTypeRoom){

                roomModel.findOne({_id:targetId},function(err,findResult){

                    if(!findResult){
                        callBack(Const.responsecodeAddOutgoingHookWrongTargetId,null);
                        return;
                    }
                    
                    result.target = findResult;
                    done(err,result);
                     
                });
                
            }
            
            else {
                callBack(Const.responsecodeAddOutgoingHookWrongTargetType,null);
                return;
            }

            
        },
        function(result,done){

            // save to database
            var model = new hookModel({
                userId:userId,
                identifier:"",
                hookType: Const.hookTypeOutgoing,
                url: url,
                targetType: targetType,
                targetId: targetId,
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


module["exports"] = NewOutgoingHook;