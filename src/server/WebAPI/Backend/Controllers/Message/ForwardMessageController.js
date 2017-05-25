/** Called for /api/v2/message/forward API */


var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var Utils = require( pathTop + 'lib/utils');

var OrganizationModel = require( pathTop + 'Models/Organization');
var MessageModel = require( pathTop + 'Models/Message');
var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var SendMessageLogic = require(pathTop +  "Logics/SendMessage");

var ForwardMessageController = function(){
}

_.extend(ForwardMessageController.prototype,BackendBase.prototype);

ForwardMessageController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v2/message/forward Forward Message
     * @apiName ForwardMessage
     * @apiGroup WebAPI
     * @apiDescription Returns forward message
     * @apiHeader {String} access-token Users unique access-token.
     * @apiParam {string} messageId messageId
     * @apiParam {string} roomId roomId of Spika ( exp: 1-56cd9c45b84f5a1b393abb8f-56cdd6a358501da66d73a5dc)
     * @apiSuccessExample Success-Response:

{
	"code": 1,
	"time": 1458051079100,
	"data": {
		"message": {
			"__v": 0,
			"user": "56c32ae5331dd81f8134f201",
			"userID": "56c32acd331dd81f8134f200",
			"roomID": "3-56e7e9e138a97a86db83f3cf",
			"message": "",
			"localID": "_roIF6lUllHg4RboTEr70iJHntIAuPLCc",
			"type": 2,
			"created": 1458051079096,
			"_id": "56e818070f2ba9df173e6289",
			"seenBy": [],
			"file": {
				"thumb": {
					"id": "56e8152b31906da71481643b",
					"name": "thumb_2014-06-03 17.23.38.jpg",
					"size": 32200.000000000004,
					"mimeType": "image/jpeg"
				},
				"file": {
					"id": "56e8152b31906da71481643a",
					"name": "2014-06-03 17.23.38.jpg",
					"size": 1438407,
					"mimeType": "image/jpeg"
				}
			}
		}
	}
}

**/
    
    router.post('/',tokenChecker,function(request,response){
        
        var roomId = request.body.roomId;
        var messageId = request.body.messageId;
        
        if(!roomId || roomId == ""){
            self.successResponse(response,Const.responsecodeForwardMessageInvalidChatId);
            return;
        }

        if(!messageId || messageId == ""){
            self.successResponse(response,Const.responsecodeForwardMessageInvalidMessageId);
            return;
        }
        
        var messageModel = MessageModel.get();

        async.waterfall([function(done){
            
            var result = {};
            
            messageModel.findOne({_id:messageId},function(err,messageFindResult){
                
                if(!messageFindResult){
                    self.successResponse(response,Const.responsecodeForwardMessageInvalidMessageId);
                    return;
                }
                
                result.originalMessage = messageFindResult;
                done(null,result);
                
            });

        },
        function(result,done){
            
            var messageParam = result.originalMessage.toObject();
            messageParam.roomID = roomId;
            messageParam.localID = "";
             
            
            SendMessageLogic.send(messageParam,() => {
                done("unknown error",result);
            },() => {
                done(null,result);
            });
            
        }
        ],
        function(err,result){
            
            if(err){
                console.log("critical err",err);
                self.errorResponse(response,Const.httpCodeServerError);
                return;
            }
            
            self.successResponse(response,Const.responsecodeSucceed,{
                message : result.sendMessageResult
            });
            
        });
        
    });
   
    return router;

}

module["exports"] = new ForwardMessageController();
