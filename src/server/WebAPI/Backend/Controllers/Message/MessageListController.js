/** Called for /api/v2/message/send API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require(pathTop +"lib/consts");
var Config = require(pathTop +"lib/init");
var DatabaseManager = require(pathTop +'lib/DatabaseManager');
var Utils = require(pathTop +'lib/utils');

var HookModel = require( pathTop + 'Models/Hook');
var UserModel = require( pathTop + 'Models/User');

var SpikaDatabaseManager = require( pathTop + '../../modules_customised/spika/src/server/lib/DatabaseManager');
var SpikaSendMessageLogic = require( pathTop + '../../modules_customised/spika/src/server/Logics/SendMessage');
var SpikaLoginLogic = require( pathTop + '../../modules_customised/spika/src/server/Logics/Login');

var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

/** Called for /api/v2/message/send API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require(pathTop +"lib/consts");
var Config = require(pathTop +"lib/init");
var DatabaseManager = require(pathTop +'lib/DatabaseManager');
var Utils = require(pathTop +'lib/utils');


var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');


var MessageListController = function(){
}

_.extend(MessageListController.prototype,RequestHandlerBase.prototype);

MessageListController.prototype.init = function(router){
        
    var self = this;

    /**
     * @api {get} /message/list/:roomID/:lastMessageID Get messages sent to room
     * @apiName Get messages of the room
     * @apiGroup WebAPI
     * @apiDescription Get last 50 message from the room

     * @apiParam {String} RoomID ID of room
     * @apiParam {String} lastMessageID MessageID of last message already shown. To get last 50 message put this param 0
     *
     * @apiSuccess {String} Token
     * @apiSuccess {String} User Model of loginned user
     *     
     * @apiSuccessExample Success-Response:
{

{
    "code": 1,
    "data": [
        {
            "__v": 0,
            "_id": "55d2d194caf997b543836fc8",
            "created": 1439879572232,
            "message": "",
            "roomID": "test",
            "type": 1001,
            "user": {
                "userID": "test",
                "name": "test",
                "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                "token": "UI6yHxeyZnXOZ1EgT6g5ftwD",
                "created": 1439878817506,
                "_id": "55d2cea1caf997b543836fb2",
                "__v": 0
            },
            "userID": "test",
            "seenBy": [
                {
                    "user": {
                        "userID": "test2",
                        "name": "test2",
                        "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                        "token": "YMsHeg3KEQIhtvt46W5fgnaf",
                        "created": 1439878824411,
                        "_id": "55d2cea8caf997b543836fb6",
                        "__v": 0
                    },
                    "at": 1439879572353
                },
                {
                    "user": {
                        "userID": "test3",
                        "name": "tset3",
                        "avatarURL": "http://45.55.81.215:80/img/noavatar.png",
                        "token": "TahnOaC6JzldCh6gAmJs3jMC",
                        "created": 1439878820142,
                        "_id": "55d2cea4caf997b543836fb4",
                        "__v": 0
                    },
                    "at": 1439879572361
                }
            ]
        },
        ...
    ]
}

    */
    
    router.get('/:roomID/:lastMessageID',tokenChecker,function(request,response){
                
        var roomID = request.params.roomID;
        var lastMessageID = request.params.lastMessageID;
        
        if(Utils.isEmpty(roomID)){
            
            self.successResponse(response,Const.resCodeMessageListNoRoomID);
                
            return;
            
        }
        
        async.waterfall([
        
            function (done) {

                MessageModel.findMessages(roomID,lastMessageID,Const.pagingLimit,function (err,data) {
                    
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
            function (err, data) {
                
                if(err){

                    self.errorResponse(
                        response,
                        Const.httpCodeSeverError
                    );
                
                }else{
                    
                    // encrypt message
                    var encryptedMessages = _.map(data,function(message){

                        if(message.type == Const.messageTypeText){
                            message.message = BridgeManager.hook('encryptMessage',message.message);
                        }
                        
                        return message;
                        
                    });

                    self.successResponse(response,Const.responsecodeSucceed,{messages:encryptedMessages});
                    
                }
                     
            }
            
        );
        
    });

}


module["exports"] = new MessageListController();

