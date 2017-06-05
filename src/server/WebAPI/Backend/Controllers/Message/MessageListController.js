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
var FavoriteModel = require( pathTop + 'Models/Favorite');

var Utils = require( pathTop + 'lib/utils');

var PolulateMessageLogic = require( pathTop + 'Logics/PolulateMessage');
var UpdateHistory = require( pathTop + 'Logics/UpdateHistory');

var SocketAPIHandler = require( pathTop + 'SocketAPI/SocketAPIHandler');

var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var MessageLoadDirection = {
    appendNoLimit:'allto',
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

            else if(direction == MessageLoadDirection.append){

                var limit = Const.pagingLimit;
                if(lastMessageId != 0)
                    limit = 0;

                MessageModel.findNewMessages(roomId,lastMessageId,limit,function (err,data) {
                    
                    done(err,data);

                });

            }

            else if(direction == MessageLoadDirection.appendNoLimit){

                MessageModel.findAllMessages(roomId,lastMessageId,function (err,data) {
                    
                    done(err,data);

                });

            }

        },
        function(messages,done){

            if(messages.length > 0){

                MessageModel.populateMessages(messages,function (err,data) {
                    
                    done(err,data);

                });

            } else {

                done(null,messages);

            }
  
        },
        function(messages,done){

            //
            done(null,messages);

            // handle seen by
            var userID = request.user._id.toString();

            var messagesToNotifyUpdate = [];

            messages.forEach((message) => {

                var seenBy = message.seenBy;

                if(!seenBy)
                    seenBy = [];
                
                var isExist = _.find(seenBy,(seenByRow) => {

                    return userID == seenByRow.userID;

                });

                if(!isExist){

                    // add seenby
                    seenBy.push({
                        user:request.user._id.toString(),
                        at:Utils.now(),
                        version:2
                    });

                    messageModel.update({ 
                        _id: message._id 
                    },{ 
                        seenBy: seenBy
                    },(err,updateResult) => {

                        //console.log(message._id);
                        //console.log(err,updateResult);

                    });

                    message.seenBy = seenBy;
                    
                    messagesToNotifyUpdate.push(message);

                }
              
            });

            // notify if exists
            if(messagesToNotifyUpdate.length > 0){

                SocketAPIHandler.emitToRoom(roomId,'updatemessages',messagesToNotifyUpdate);

            };

        },
        function(messages,done){
            
            // add favorite

            var userID = request.user._id;
            var favoriteModel = FavoriteModel.get();
            
            favoriteModel.find({
                userId:userID
            },function(err,favoriteFindResult){
                
                var messageIds = _.map(favoriteFindResult,function(favorite){
                    
                    return favorite.messageId;
                        
                });
                
                var messagesFav = _.map(messages,function(message){
                    
                    var isFavorite = 0;
                    
                    if(messageIds.indexOf(message._id.toString()) != -1)
                        isFavorite = 1;
                    
                    message.isFavorite = isFavorite;
                    
                    return message;
                        
                });
                
                done(null,messagesFav);
                
            });
            
        },function(result,done){
            
            // update history
            UpdateHistory.resetUnreadCount({
                roomID:roomId,
                userID:request.user._id
            });

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
