
var _ = require('lodash');
var async = require('async');

var DatabaseManager = require("../lib/DatabaseManager");
var EncryptionManager = require("../lib/EncryptionManager");

var Utils = require("../lib/utils");
var Const = require("../lib/consts");
var Config = require("../lib/init");
var SocketHandlerBase = require("./SocketHandlerBase");

var UserModel = require("../Models/User");
var MessageModel = require("../Models/Message");

var NotifyNewMessage = require("../Logics/NotifyNewMessage");

var SendMessageActionHandler = function(){
    
}

_.extend(SendMessageActionHandler.prototype,SocketHandlerBase.prototype);

SendMessageActionHandler.prototype.attach = function(io,socket){
        
    var self = this;

    /**
     * @api {socket} "sendMessage" Send New Message
     * @apiName Send Message
     * @apiGroup Socket 
     * @apiDescription Send new message by socket
     * @apiParam {string} roomID Room ID
     * @apiParam {string} userID User ID
     * @apiParam {string} type Message Type. 1:Text 2:File 3:Location
     * @apiParam {string} message Message if type == 1
     * @apiParam {string} fileID File ID if type == 2
     * @apiParam {object} location lat and lng if type == 3
     *
     */
     
    socket.on('sendMessage', function(param){
                        
                        
        if(!param.roomID){
            socket.emit('socketerror', {code:Const.resCodeSocketSendMessageNoRoomID}); 
            return;
        }


        if(!param.userID){
            socket.emit('socketerror', {code:Const.resCodeSocketSendMessageNoUserId});
            return;
        }

        if(!param.type){
            socket.emit('socketerror', {code:Const.resCodeSocketSendMessageNoType}); 
            return;
        }
                        
        if(param.type == Const.messageTypeText && _.isEmpty(param.message)){
            socket.emit('socketerror', {code:Const.resCodeSocketSendMessageNoMessage});               
            return;
        }

        if(param.type == Const.messageTypeLocation && (
                                        _.isEmpty(param.location) ||
                                        _.isEmpty(param.location.lat) ||
                                        _.isEmpty(param.location.lng))){
                                        
            socket.emit('socketerror', {code:Const.resCodeSocketSendMessageNoLocation});               
            return;
        
        }
        
        var userID = param.userID;

        // decript message
        if(param.type == Const.messageTypeText){

            param.message = EncryptionManager.decryptText(param.message);

        }

        param.ipAddress = socket.handshake.headers['x-forwarded-for'];

        if(!param.ipAddress)
            param.ipAddress = socket.handshake.address;

        var userID = param.userID;
        
        var userModel = UserModel.get();

        //save to DB
        userModel.findOne({
                _id:userID
            },function (err,user) {
                        
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

                if(err) {
                    if(onError)
                        onError(err);
                        
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
    
                    NotifyNewMessage.notify(messageObj);
                
                });

            });
            
        });

    });

}

module["exports"] = new SendMessageActionHandler();