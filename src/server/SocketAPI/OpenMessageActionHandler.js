/** ping-ok Socket API  */

var _ = require('lodash');
var async = require('async');

var DatabaseManager = require("../lib/DatabaseManager");

var Utils = require("../lib/utils");
var Const = require("../lib/consts");
var Config = require("../lib/init");
var SocketHandlerBase = require("./SocketHandlerBase");
var SocketAPIHandler = require("./SocketAPIHandler");

var GroupModel = require('../Models/Group');
var RoomModel = require('../Models/Room');
var UserModel = require('../Models/User');

var MessageModel = require('../Models/Message');

var OpenMessageActionHandler = function(){
    
}

_.extend(OpenMessageActionHandler.prototype,SocketHandlerBase.prototype);

OpenMessageActionHandler.prototype.attach = function(io,socket){
        
    var self = this;

    /**
     * @api {socket} "openMessage" open unread message
     * @apiName openMessage
     * @apiGroup Socket 
     * @apiDescription set user online

     */
    socket.on('openMessage', function(param){
        
        if(!param.messageID){
            socket.emit('socketerror', {code:Const.resCodeSocketOpenMessageWrongMessageID}); 
            return;
        }

        if(!param.userID){
            socket.emit('socketerror', {code:Const.resCodeSocketOpenMessageNoUserId});
            return;
        }

        var messageModel = MessageModel.get();

        async.waterfall([(done) => {

            var result = {};

            messageModel.findOne({
                _id: param.messageID
            },(err,findResult) => {

                result.message = findResult;
                done(err,result);

            });
            
        },
        (result,done) => {

            var seenByRow = { 
                        user:param.userID,
                        at:Utils.now(),
                        version:2
                    }   ;

            messageModel.update({ 
                _id: param.messageID
            },{ 
                $push: { seenBy: seenByRow   
                } 
            },(err,updateResult) => {

                console.log(err,updateResult);

            });

            result.message.seenBy.push(seenByRow);

            done(null,result);

        },
        (result,done) => {

            MessageModel.populateMessages([result.message],function (err,data) {
                
                done(err,data[0]);

            });

        }],

        (err,message) => {

            if(err){
                socket.emit('socketerror', {code:Const.resCodeSocketUnknownError});  
                return;
            }

            SocketAPIHandler.emitToRoom(message.roomID,'updatemessages',[message]);

        });

    });

}

module["exports"] = new OpenMessageActionHandler();