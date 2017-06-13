/** Handles all notification for new nessaage, socket and push */

var _ = require('lodash');
var async = require('async');
var request = require('request');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var Utils = require("../lib/utils");

var DatabaseManager = require('../lib/DatabaseManager');
var EncryptionManager = require('../lib/EncryptionManager');
var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');

var UpdateHistory = require("./UpdateHistory");
var NotifyNewMessage = require("./NotifyNewMessage");

var HookModel = require('../Models/Hook');
var UserModel = require('../Models/User');
var MessageModel = require("../Models/Message");

var SendMessage = {
    
    send: function(param,errorCB,successCB){

        var userID = param.userID;
        var roomID = param.roomID;

        // decript message
        if(param.type == Const.messageTypeText){

            param.message = EncryptionManager.decryptText(param.message);

        }

        var userID = param.userID;
        var userModel = UserModel.get();

        async.waterfall([(done) => {

            var result = {};

            //save to DB
            userModel.findOne({
                _id:userID
            }, (err,user) => {
            
                if(err){

                    if(errorCB)
                        errorCB(err);
                        
                    return;
                }
                
                result.user = user;

                done(null,result);

            });

        },(result,done) => {
            // check block
            var messageTargetTypeAry = roomID.split("-");
            if(messageTargetTypeAry.length < 2){

                if(errorCB)
                    errorCB("invalid room id");
                    
                return;

            }

            var messageTargetType = messageTargetTypeAry[0];

            if(messageTargetType == Const.chatTypePrivate){

                var userIdTo = messageTargetTypeAry[1];

                if(userIdTo == userID)
                    userIdTo = messageTargetTypeAry[2];
                
                // find block
                userModel.findOne({
                    _id:userIdTo
                }, (err,user) => {
                
                    if(err || !user ){

                        if(errorCB)
                            errorCB("no user found");
                            
                        return;
                    }

                    var isBlocked = _.find(user.blocked,(userIdTmp) => {

                        return userIdTmp == userID;

                    });

                    if(isBlocked){
                        // do nothing
                        return;
                    }

                    done(null,result);

                });

            }else{
                done(null,result);
            }

        },(result,done) => {

            var objMessage = {
                remoteIpAddress:param.ipAddress,
                userID: userID,
                roomID: param.roomID,
                message: param.message,
                localID: param.localID,
                type: param.type,
                file: null,
                attributes: param.attributes,
                created: Utils.now()                   
            };
            
            if(result.user){
                objMessage.user = result.user._id
            }

            if(!_.isEmpty(param.file)){
                
                objMessage.file = {
                    file : {
		                id: param.file.file.id,
    		            name: param.file.file.name,
    		            size: param.file.file.size,
    		            mimeType: param.file.file.mimeType
                    }
                };
                
                if(!_.isEmpty(param.file.thumb)){
                 
                    objMessage.file.thumb = {
		                id: param.file.thumb.id,
    		            name: param.file.thumb.name,
    		            size: param.file.thumb.size,
    		            mimeType: param.file.thumb.mimeType
                    };
                
                }
                
            }

            if(!_.isEmpty(param.location)){
                objMessage.location = param.location;
            }

            // save to database
            var messageModel = MessageModel.get();

            var newMessage = new messageModel(objMessage);

            newMessage.save(function(err,message){

                if(err && errorCB){
                    errorCB(err);
                    return;
                }

                result.message = message;

                done(err,result);

            });

        },(result,done) => {

            MessageModel.populateMessages(result.message,function (err,data) {
                                    
                var messageObj = data[0];
                messageObj.localID = '';
                messageObj.deleted = 0;
                
                if(!_.isEmpty(param.localID))
                    messageObj.localID = param.localID;
                
                // ecrypt message
                var sendData = _.cloneDeep(data[0]);

                if(sendData.type == Const.messageTypeText){
                    var encryptedMessage = EncryptionManager.encryptText(sendData.message);
                    sendData.message = encryptedMessage;
                }

                UpdateHistory.updateByMessage(messageObj,() => {
                    NotifyNewMessage.notify(messageObj);
                });

                result.messagePopulated = messageObj;

                done(err,result);

            });
            
        }],
        (err,result) => {

            if(err){
                console.log("errro while sending message",err);

                if(errorCB)
                    errorCB(err);
                    
                return;
            }

            if(successCB)
                successCB(result.messagePopulated);
                
        });

    }
    
};


module["exports"] = SendMessage;