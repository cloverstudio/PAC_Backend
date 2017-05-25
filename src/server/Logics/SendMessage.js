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

        // decript message
        if(param.type == Const.messageTypeText){

            param.message = EncryptionManager.decryptText(param.message);

        }

        var userID = param.userID;
        
        var userModel = UserModel.get();

        //save to DB
        userModel.findOne({
                _id:userID
            },function (err,user) {
            
            if(err || !user ){

                if(errorCB)
                    errorCB();
                    
                return;
            }

            var objMessage = {
                remoteIpAddress:param.ipAddress,
                user:user._id,
                userID: userID,
                roomID: param.roomID,
                message: param.message,
                localID: param.localID,
                type: param.type,
                file: null,
                attributes: param.attributes,
                created: Utils.now()                   
            };
            
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
                    errorCB();
                    return;
                }

                MessageModel.populateMessages(message,function (err,data) {
                                        
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
                    
                    if(successCB)
                        successCB(messageObj);
                });

            });
            
        });

    }
    
};


module["exports"] = SendMessage;