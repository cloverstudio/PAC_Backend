var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var Utils = require( pathTop + 'lib/utils');

var MessageListLogic = require( pathTop + "Logics/MessageList");

var tokenChecker = require( pathTop + 'lib/authApi');
var BackendBase = require('../BackendBase');

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
        
        var userID = request.user._id.toString();
        var roomId = request.params.roomId;
        var lastMessageId = request.params.lastMessageId;
        var direction = request.params.direction? request.params.direction : MessageLoadDirection.append;

        if(!roomId){
            self.successResponse(response,Const.responsecodeMessageListInvalidParam);
            return;
        }

        MessageListLogic.get(userID,roomId,lastMessageId,direction,true,(messages) => {
            self.successResponse(response,Const.responsecodeSucceed,{
                messages:messages
            });
        },(err) => {
            console.log("critical err",err);
            self.errorResponse(response,Const.httpCodeServerError);
            return;
        });

    });
   
    return router;

}

module["exports"] = new MessageListController();
