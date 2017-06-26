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

        var userID = request.user._id.toString();
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

            // handle seen by

            var messagesToNotifyUpdate = [];

            if(messages.length == 0){

                done(null,{
                    messagesToNotifyUpdate:[],
                    messages:[]
                });

                return;
            }

            async.eachSeries(messages,(message,doneEach) => {

                var seenBy = message.seenBy;

                if(!seenBy)
                    seenBy = [];
                
                var isExist = _.find(seenBy,(seenByRow) => {

                    return userID == seenByRow.user;

                });


                if(!isExist)
                    console.log(request.user._id.toString(),message.userID)

                if(!isExist && message.userID != request.user._id.toString()){

                    // add seenby
                    seenBy.push({
                        user:request.user._id.toString(),
                        at:Utils.now(),
                        version:2
                    });

                    message.seenBy = seenBy;
                    messagesToNotifyUpdate.push(message._id.toString());

                    messageModel.update({ 
                        _id: message._id 
                    },{ 
                        seenBy: seenBy
                    },(err,updateResult) => {

                        doneEach(err);

                    });
                    
                } else {

                    doneEach();

                }

            },(err) => {

                done(null,{
                    messagesToNotifyUpdate:messagesToNotifyUpdate,
                    messages:messages
                });

            });

        },
        function(result,done){
    

            var messages = result.messages;
            var messageIdsToNotify = result.messagesToNotifyUpdate;

            if(messages.length > 0){

                MessageModel.populateMessages(messages,function (err,data) {
                    
                    done(null,messages);
                    
                    var data = messages;
                    
                    // send notification

                    var messagesToNotify = _.filter(data,(obj) => {

                        return messageIdsToNotify.indexOf(obj._id.toString()) != -1

                    });

                    // notify if exists
                    if(messagesToNotify.length > 0){

                        var roomID = messagesToNotify[0].roomID;
                        var chatType = roomID.split("-")[0];
                        var roomIDSplitted = roomID.split("-");

                        // websocket notification
                        if(chatType == Const.chatTypeGroup){
                            
                            SocketAPIHandler.emitToRoom(roomID,'updatemessages',messagesToNotify);
                            
                        } else if(chatType == Const.chatTypeRoom) {
                            
                            SocketAPIHandler.emitToRoom(roomID,'updatemessages',messagesToNotify);

                        } else if(chatType == Const.chatTypePrivate){
                            
                            var splitAry = roomID.split("-");
                            
                            if(splitAry.length < 2)
                                return;
                            
                            var user1 = splitAry[1];
                            var user2 = splitAry[2];
                            
                            var toUser = null;
                            var fromUser = null;

                            if(user1 == userID){
                                toUser = user2;
                                fromUser = user1;
                            }else{
                                toUser = user1;
                                fromUser = user2;
                            }

                            // send to user who got message
                            DatabaseManager.redisGet(Const.redisKeyUserId + toUser,function(err,redisResult){
                                
                                var socketIds = _.pluck(redisResult,"socketId");
                                
                                if(!_.isArray(redisResult))
                                    return;
                                
                                _.forEach(redisResult,function(socketIdObj){
                                    SocketAPIHandler.emitToSocket(socketIdObj.socketId,'updatemessages',messagesToNotify);
                                })

                            });

                        }
                        
                    };

                });

            } else {

                done(null,messages);
            }


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
