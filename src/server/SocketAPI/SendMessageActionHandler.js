
var _ = require('lodash');
var async = require('async');

var DatabaseManager = require("../lib/DatabaseManager");

var Utils = require("../lib/utils");
var Const = require("../lib/consts");
var Config = require("../lib/init");
var SocketHandlerBase = require("./SocketHandlerBase");

var UserModel = require("../Models/User");
var MessageModel = require("../Models/Message");

var SendMessageLogic = require("../Logics/SendMessage");

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
                                        !param.location ||
                                        !param.location.lat ||
                                        !param.location.lng )){
                                        
            socket.emit('socketerror', {code:Const.resCodeSocketSendMessageNoLocation});               
            return;
        
        }

        param.ipAddress = socket.handshake.headers['x-forwarded-for'];

        if(!param.ipAddress)
            param.ipAddress = socket.handshake.address;

        SendMessageLogic.send(param,() => {

            socket.emit('socketerror', {code:Const.resCodeSocketUnknownError});  

        },() => {

            // success

        });

    });

}

module["exports"] = new SendMessageActionHandler();