/**  Called for /api/v2/test API */

var _ = require('lodash');
var async = require('async');
var express = require('express');
var router = express.Router();

var pathTop = "../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var Utils = require( pathTop + "lib/utils");

var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var checkAPIKey = require( pathTop + 'lib/authApiV3');

var APIBase = require('./APIBase');

var UserModel = require(pathTop + 'Models/User');

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
        var file = request.body.file;

        var userModel = UserModel.get();

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

        if(messageType == Const.messageTypeText && !message){
            response.status(422).send('Bad Parameter');
            return;
        }

        if(messageType == Const.messageTypeFile && !file){
            response.status(422).send('Bad Parameter');
            return;
        }

        var roomId = targetType + "-" + target;

        async.waterfall([(done) => {

            var result = {};

            if(targetType != Const.chatTypePrivate){
                done(null,result);
                return;
            }

             // find user
            userModel.findOne({
                userid:target,
                organizationId:request.user.organizationId
            },function(err,findResult){
                
                if(!findResult){
                    done({
                        status: 422,
                        message: "Bad Parameter"
                    },null);
                    
                    return;
                }
                
                roomId = Utils.chatIdByUser(findResult,request.user);

                done(null,result);

            });
            
        },
        (result,done) => {


            SendMessageLogic.send(
                
                {
                    userID: request.user._id,
                    roomID: roomId,
                    message: message,
                    plainTextMessage: true,
                    type: messageType,
                    file:file
                },
                
                function(err){
                    
                    done(err,result);
                    
                },

                function(data){
                    
                    result.message = data;
                    done(null,result);

                }
                
            )

        }
        ],
        (err,result) => {

            if(err){    

                if(err.status && err.message)
                    response.status(err.status).send(err.message);
                else
                    response.status(500).send("Server Error");

                return;
            }

            self.successResponse(response,Const.responsecodeSucceed,
                                    
                {
                    "message": {
                        "_id": result.message._id,
                        "message": result.message.message,
                        "roomID": result.message.roomID,
                        "created": result.message.created
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

        });

    });

    return router;
}

module["exports"] = new SendMessageController();
