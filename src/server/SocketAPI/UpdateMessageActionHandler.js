
var _ = require('lodash');
var async = require('async');

var DatabaseManager = require("../lib/DatabaseManager");
var EncryptionManager = require("../lib/EncryptionManager");

var Utils = require("../lib/utils");
var Const = require("../lib/consts");
var Config = require("../lib/init");
var SocketHandlerBase = require("./SocketHandlerBase");

var UserModel = require("../Models/User");
var HistoryModel = require("../Models/History");
var MessageModel = require("../Models/Message");

var NotifyUpdateMessage = require("../Logics/NotifyUpdateMessage");

var UpdateMessageActionHandler = function(){
    
}

_.extend(UpdateMessageActionHandler.prototype,SocketHandlerBase.prototype);

UpdateMessageActionHandler.prototype.attach = function(io,socket){
        
    var self = this;

    /**
     * @api {socket} "updateMessage" Update Message
     * @apiName Update Message
     * @apiGroup Socket 
     * @apiDescription Delete Message
     * @apiParam {string} userID User ID
     * @apiParam {string} messageID Message ID
     * @apiParam {string} message Mesage
     */
     
    socket.on('updateMessage', function(param){
                        
        const newMessage = param.message;

        if(!param.messageID){
            socket.emit('socketerror', {code:Const.resCodeSocketUpdateNoMessageID}); 
            return;
        }


        if(!param.userID){
            socket.emit('socketerror', {code:Const.resCodeSocketUpdateNoUserID});
            return;
        }

        var messageModel = MessageModel.get();
        const historyModel = HistoryModel.get();

        async.waterfall([
            function(done){

                var result = {};

                messageModel.findOne({
                    _id:param.messageID
                },function(err,findResult){

                    if(!findResult){
                        done("no message found",result);
                        return;
                    }

                    result.message = findResult;

                    done(err,result);

                });

            },
            function(result,done){

                historyModel.find({
                    "lastMessage.messageId" : result.message._id.toString()
                },(err,findResult) => {

                    result.histories = findResult;
                    done(err, result);

                });


            },
            function(result,done){

                result.histories.forEach((element) => {

                    historyModel.update({
                        _id: element._id
                    },{
                        "lastMessage.message" : newMessage,
                        lastUpdate: Utils.now()
                    },(err,updateResult) => {

                    });

                });

                done(null,result);

            },
            function(result,done){

                result.message.update({
                    message: newMessage,
                },{},function(err,userResult){

                    if(err) {
                        done("DB error",result);     
                        return;
                    }

                    MessageModel.populateMessages(result.message,function (err,messages) {

                        if(err) {
                            socket.emit('socketerror', {code:Const.resCodeSocketUnknownError});               
                            return;
                        }
                        
                        if(messages.length > 0){
                                                    
                            var obj = messages[0];
                            obj.message = newMessage;

                        }

                        NotifyUpdateMessage.notify(obj);
                        
                        done(null,result);     

                    });

                });

            },  
        ],
        function(err,result){

            if(err){
                socket.emit('socketerror', {code:Const.resCodeSocketDeleteNoUserID});
                return;
            }

            

        });

    });

}

module["exports"] = new UpdateMessageActionHandler();