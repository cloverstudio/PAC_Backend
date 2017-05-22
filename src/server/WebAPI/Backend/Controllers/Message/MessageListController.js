var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");

var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var EncryptionManager = require( pathTop + 'lib/EncryptionManager');

var MessageModel = require( pathTop + 'Models/Message');

var Utils = require( pathTop + 'lib/utils');

var PolulateMessageLogic = require( pathTop + 'Logics/PolulateMessage');

var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var MessageLoadDirection = {
    append:'new',
    prepend:'old'
};

var MessageListController = function(){
}

_.extend(MessageListController.prototype,BackendBase.prototype);

MessageListController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v2/message/list/:roomId/:lastMessageId/:direction
     * @apiName MessageList
     * @apiGroup WebAPI
     * @apiDescription Returns list of messages. Direction should be string 'old' or 'new'
     * @apiHeader {String} access-token Users unique access-token.
     * @apiSuccessExample Success-Response:
     {}
   **/
    
    router.get('/:roomId/:lastMessageId/:direction',tokenChecker,function(request,response){
        
        var messageModel = MessageModel.get();

        var roomId = request.params.roomId;
        var lastMessageId = request.params.lastMessageId;
        var direction = request.params.direction? request.params.direction : MessageLoadDirection.append;

        if(!roomId){
            self.successResponse(response,Const.responsecodeMessageListInvalidParam);
            return;
        }

        async.waterfall([function(done){
            
            if(direction == MessageLoadDirection.prepend){

                MessageModel.findOldMessages(roomId,lastMessageId,Const.pagingLimit,function (err,data) {
                    
                    done(err,data);

                });
                
            }

            else {

                var limit = Const.pagingLimit;
                if(lastMessageId != 0)
                    limit = 0;

                MessageModel.findNewMessages(roomId,lastMessageId,limit,function (err,data) {
                    
                    done(err,data);

                });

            }

        },
        function(messages,done){

            // add seenby
            MessageModel.populateMessages(messages,function (err,data) {
                
                done(err,data);

            });
            
        },
        function(result,done){
            
            // add favorite
            done(null,result);
            
        },function(result,done){
            
            done(null,result);
            
        },function(result,done){
            
            done(null,result);
            
        }
        ],
        function(err,result){
            
            if(err){
                console.log("critical err",err);
                self.errorResponse(response,Const.httpCodeServerError);
                return;
            }
            
            // encrypt message
            var encryptedMessages = _.map(result,function(message){

                if(message.type == Const.messageTypeText){
                    message.message = EncryptionManager.encryptText(message.message)
                }
                
                return message;
                
            });

            self.successResponse(response,Const.responsecodeSucceed,{
                messages:encryptedMessages
            });
            
        });
        
    });
   
    return router;

}

module["exports"] = new MessageListController();
