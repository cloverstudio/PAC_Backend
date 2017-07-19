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
{
	"code": 1,
	"time": 1499868072495,
	"data": {
		"messages": [{
			"__v": 0,
			"_id": "594abd2a17a3077a5c0381dc",
			"created": 1498070314307,
			"localID": "culkpvtyEs1G6OUqQ2RkkjZXKBjZCFC7",
			"message": "0301dc83cfffa5a368ade6872e397f7595c7cee27261a8cd0282c16caf0a41b3e86555ce92acf0c7ef00796fb6ff0540cf4df36a7e270cc840e84fbc3f293276bc243894f6e31a0ad81af10d9339fd1615aada49b4476f99c967a472437ffaa31636dafa8643eee8853b8ed7305111756625",
			"remoteIpAddress": "109.60.110.82",
			"roomID": "3-58fdd63c5b9736991af8ca13",
			"type": 1,
			"user": {
				"_id": "56e0088062a63ebf55eef39a",
				"description": "Samo jakooooo!!!",
				"name": "Jurica Blazevic",
				"organizationId": "56e005b1695213295419f5df",
				"userid": "jurica.blazevic",
				"avatar": {
					"thumbnail": {
						"originalName": "417020_10150655766113706_100243839_n.jpg",
						"size": 28617,
						"mimeType": "image/png",
						"nameOnServer": "Nk51aWGNBmpP5im8x3ecJwAKizI7ANJe"
					},
					"picture": {
						"originalName": "417020_10150655766113706_100243839_n.jpg",
						"size": 28617,
						"mimeType": "image/png",
						"nameOnServer": "1QKB80SOm3waYooa3enPxPBIbiENj5Y6"
					}
				}
			},
			"userID": "56e0088062a63ebf55eef39a",
			"seenBy": [{
				"version": 2,
				"at": 1498623027378,
				"user": "57f315081d9cabd56e905080"
			}..
            ],
			"isFavorite": 0
		}, ...
		}]
	}
}

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
                    
                    done(null,data);
                    
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
