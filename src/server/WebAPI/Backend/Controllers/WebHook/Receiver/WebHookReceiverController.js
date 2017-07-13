/** Called for /api/v2/hook/r API  */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../../";

var Const = require(pathTop +"lib/consts");
var Config = require(pathTop +"lib/init");
var DatabaseManager = require(pathTop +'lib/DatabaseManager');
var Utils = require(pathTop +'lib/utils');

var HookModel = require( pathTop + 'Models/Hook');
var UserModel = require( pathTop + 'Models/User');

var EncryptionManager = require(pathTop + 'lib/EncryptionManager');
var BackendBase = require('../../BackendBase');

var SendMessageLogic = require(pathTop + "Logics/SendMessage");
var AdapterFactory = require('./Adapter/AdapterFactory');

var WebHookReceiverController = function(){
}

_.extend(WebHookReceiverController.prototype,BackendBase.prototype);

WebHookReceiverController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v2/hook/r/:hookIdentifier WebHookReceiver
     * @apiName WebHookReceiver
     * @apiGroup WebAPI
     * @apiDescription Returns messageId
     * @apiSuccessExample Success-Response:
{
    "code": 1,
    "time": 1457090503752,
    "data": {
        "messageId": 121212
    }
}

**/
    
    router.post('/:hookIdentifier',function(request,response){
        
        var hookIdentifier = request.params.hookIdentifier;
        var hookModel = HookModel.get();
        
        if(!hookIdentifier){
            self.successResponse(response,Const.responsecodeInboundHookWringIdentifier);
            return;
        }
        
        async.waterfall([function(done){
            
            var result = {};
            
            hookModel.findOne({
                identifier: hookIdentifier,
                hookType:Const.hookTypeInbound
            },function(err,findResult){
                
                if(!findResult){
                    self.successResponse(response,Const.responsecodeInboundHookWringIdentifier);
                    return;
                }
                
                result.hook = findResult;
                done(err,result)
                
            });
            
            
        },
        function(result,done){
            
            var adapter = AdapterFactory.get(request);
            
            adapter.createMessage(function(messageObj){
          
                self.createRoomId(result.hook,messageObj,function(roomId){
                    
                    if(_.isEmpty(roomId)){
                        done('noroomid',null);
                        return;
                    }
                    
                    result.roomId = roomId;
                    result.messageObj = messageObj;

                    done(null,result);
                    
                });

            });


        },
        function(result,done){

                
            result.userParam = {
                name:result.messageObj.name,
                avatarURL:result.messageObj.avatarURL,
                roomID:result.roomId,
                userID:Const.botUserIdPrefix + result.messageObj.serviceIdentifier
            };
                
            done(null,result);
            
        },
        function(result,done){

            result.messageParam = {
                roomID:result.roomId,
                type:result.messageObj.type
            }
            
            if(result.messageObj.message)
                result.messageParam.message = EncryptionManager.encryptText(result.messageObj.message);

            if(result.messageObj.file) {

                result.messageParam.file = result.messageObj.file;
            
            }

            result.messageParam.userID = Config.robotUserId;
            result.messageParam.allowRelay = request.body.allowRelay;
            result.messageParam.isHook = true;

            SendMessageLogic.send(
                
                result.messageParam,

                (err) => {
                    
                    console.log('err',err);

                    done(err,result);
                    
                },
                
                (data) => {

                    result.sendMessageResult = data;

                    done(null,result);
                    
                }
                
            )
            
        }
        ],
        function(err,result){
            
            if(err){
                console.log("critical err",err);
                self.errorResponse(response,Const.httpCodeServerError);
                return;
            }
            
            self.successResponse(response,Const.responsecodeSucceed,{
                messageId: result.sendMessageResult._id
            });
            
        });
        
    });
   
    return router;

}

WebHookReceiverController.prototype.createRoomId = function(hook,messageObj,callBack){
    //Const.botUserId
    
    var taretType = hook.targetType;
    var roomId = "";
    
    var botUser = {
        created: 0,
        _id: Const.botUserIdPrefix + messageObj.serviceIdentifier
    }
    
    var userModel = UserModel.get();
    
    if(taretType == Const.chatTypePrivate){
        
        userModel.findOne({_id:hook.targetId},function(err,userResult){
            
            if(!userResult){
                callBack(roomId);
                return;
            }
            
            callBack(Utils.chatIdByUser(botUser,userResult));
            
        });
        
    }else if(taretType == Const.chatTypeGroup){
        callBack(Utils.chatIdByGroup({
            _id: hook.targetId
        }));
        
    }else if(taretType == Const.chatTypeRoom){
        callBack(Utils.chatIdByRoom({
            _id: hook.targetId
        }));
        
    }else{
        callBack(roomId);
    }
    
}

module["exports"] = new WebHookReceiverController();
