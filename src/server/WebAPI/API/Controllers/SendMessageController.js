/**  Called for /api/v2/test API */

var _ = require('lodash');
var express = require('express');
var router = express.Router();

var pathTop = "../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var Utils = require( pathTop + "lib/utils");

var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var checkAPIKey = require( pathTop + 'lib/authApiV3');

var APIBase = require('./APIBase');

var apikeyModel = require(pathTop + 'Models/APIKey.js').get();
var organizationModel = require(pathTop + 'Models/Organization.js').get();

var SendMessageLogic = require(pathTop + "Logics/SendMessage");
var EncryptionManager = require(pathTop + 'lib/EncryptionManager');

var SendMessageController = function(){
}

_.extend(SendMessageController.prototype,APIBase.prototype);

SendMessageController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v3/message/send send messsage
     **/

    router.post('',checkAPIKey,function(request,response){

        var targetType = request.body.targetType;
        var target = request.body.target;
        var messageType = request.body.messageType;
        var message = request.body.message;

        if(!targetType){
            response.status(422).send('Bad Parameter');
            return;
        }
        
        if(!target){
            response.status(422).send('Bad Parameter');
            return;
        }

        if(!messageType){
            response.status(422).send('Bad Parameter');
            return;
        }

        if(!message){
            response.status(422).send('Bad Parameter');
            return;
        }

        var roomId = targetType + "-" + target;

        SendMessageLogic.send(
            
            {
                userID: request.user._id,
                roomID: roomId,
                message: message,
                plainTextMessage: true,
                type: messageType
            },
            
            function(err){
                
                response.status(500).send('Server error');
                
            },

            function(data){
                
                self.successResponse(response,Const.responsecodeSucceed,
                                        
                    {
                        "message": {
                            "_id": data._id,
                            "message": data.message,
                            "roomID": data.roomID,
                            "created": data.created
                        },
                        "user": {
                            "_id": request.user._id,
                            "name": request.user.name,
                            "avatar": request.user.avatar,
                            "description": request.user.description,
                            "organizationId": request.user.organizationId,
                            "sortName": request.user.sortName,
                            "userid": request.user.userid,
                            "created": request.user.created
                        }
                    }
                
                );

            }
            
        )

    });

    return router;
}

module["exports"] = new SendMessageController();
