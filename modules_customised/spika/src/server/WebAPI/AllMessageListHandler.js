var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');

var RequestHandlerBase = require("./RequestHandlerBase");
var UsersManager = require("../lib/UsersManager");
var DatabaseManager = require("../lib/DatabaseManager");
var Utils = require("../lib/Utils");
var Const = require("../const");
var async = require('async');
var formidable = require('formidable');
var fs = require('fs-extra');
var path = require('path');
var mime = require('mime');
var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');
var UserModel = require("../Models/UserModel");
var MessageModel = require("../Models/MessageModel");
var FavoriteModel = require("../../../../../src/server/Models/Favorite");
var tokenChecker = require('../lib/Auth');

var AllMessageListHandler = function(){
    
}

_.extend(AllMessageListHandler.prototype,RequestHandlerBase.prototype);

AllMessageListHandler.prototype.attach = function(router){
        
    var self = this;
    
    /**
     * @api {get} /message/listall/:roomID/:lastMessageID Get all latest messages
     * @apiName Get all latest messages of the room
     * @apiGroup WebAPI
     * @apiDescription Get all latest message from the room

     * @apiParam {String} RoomID ID of room
     * @apiParam {String} lastMessageID MessageID of last message already shown. To get last 50 message put this param 0
     *
     * @apiSuccess {String} Token
     * @apiSuccess {String} User Model of loginned user
     *     
     * @apiSuccessExample Success-Response:
{
    "code": 1,
    "data": {
        "messages": [
            {
                "_id": "564d7c613e84a5407599ce8b",
                "user": {
                    "_id": "564b1f0c6d8463e192831fe4",
                    "userID": "5638c0a71b659fc060941d87",
                    "name": "KenYasue",
                    "avatarURL": "/spika/img/noavatar.png",
                    "token": "j4vSCqcIednY5y4g3wmMJuk6",
                    "created": 1447763724451,
                    "__v": 0
                },
                "userID": "5638c0a71b659fc060941d87",
                "roomID": "564d7c593e84a5407599ce80",
                "message": "10",
                "localID": "_NNq1fIRx938rNcISLd8MGYW063RcA94X",
                "type": 1,
                "created": 1447918689029,
                "__v": 0,
                "seenBy": []
            },
            {
                "_id": "564d7c5e3e84a5407599ce8a",
                "user": {
                    "_id": "564b1f0c6d8463e192831fe4",
                    "userID": "5638c0a71b659fc060941d87",
                    "name": "KenYasue",
                    "avatarURL": "/spika/img/noavatar.png",
                    "token": "j4vSCqcIednY5y4g3wmMJuk6",
                    "created": 1447763724451,
                    "__v": 0
                },
                "userID": "5638c0a71b659fc060941d87",
                "roomID": "564d7c593e84a5407599ce80",
                "message": "98",
                "localID": "_d9mEiYGCrGLRubjIfaHAAWtPUtO1eMBl",
                "type": 1,
                "created": 1447918686869,
                "__v": 0,
                "seenBy": []
            }
        ]
    }
}
    */
    
    router.get('/:roomID/:lastMessageID',tokenChecker,function(request,response){
        
        self.logic(request,function(result){

            self.successResponse(response,Const.responsecodeSucceed,{
                token: result.token,
                messages: result.messages
            });
            
        },function(err,code){
            
            if(err){
                
                self.errorResponse(
                    response,
                    Const.httpCodeSeverError
                );
                
            }else{
                
                self.successResponse(response,code);
                
            }
            
        });
        
    });
    

}

AllMessageListHandler.prototype.logic = function(request,onSuccess,onError){
    
    var self = this;
    
    var roomID = request.params.roomID;
    var lastMessageID = request.params.lastMessageID;
     
    if(Utils.isEmpty(lastMessageID)){

        if(onError)
            onError(null,Const.resCodeMessageListNoLastMessageID);
            
        return;
        
    }

    if(Utils.isEmpty(roomID)){
        
        if(onError)
            onError(null,Const.resCodeMessageListNoRoomID);
            
        return;
        
    }

    if(lastMessageID == 0){

        if(onError)
            onError(null,Const.resCodeMessageListNoLastMessageID);
            
        return;
        
    }
    
    async.waterfall([
    
        function (done) {

            MessageModel.findAllMessagesWithLastMessage(roomID,lastMessageID,function (err,data) {
                
                done(err,data);

            });
            
        },
        function (messages,done) {

            MessageModel.populateMessages(messages,function (err,data) {
                
                done(err,data);

            });
            
        },
        function(messages,done){
            
            var userID = request.user.userID;
            var favoriteModel = FavoriteModel.get();
            
            favoriteModel.find({
                userId:userID
            },function(err,favoriteFindResult){
                
                var messageIds = _.map(favoriteFindResult,function(favorite){
                    return favorite.messageId;
                });
                
                
                var messagesFav = _.map(messages,function(message){
                    
                    var isFavorite = false;
                    
                    if(messageIds.indexOf(message._id.toString()) != -1)
                        isFavorite = true;
                    
                    message.isFavorite = isFavorite;
                    
                    return message;
                        
                });
                
                done(null,messagesFav);
                
            });

        }
    ],
        function (err, result) {
            
            if(err){
                
                onError(err,null);
                
            }else{
                
                var responseJson = {
                    messages : result
                }
                
                onSuccess(responseJson);

            }
                 
        }
    );

}

var handler = new AllMessageListHandler();
handler.attach(router);

module["exports"] = {
    handler: handler,
    router: router
};
