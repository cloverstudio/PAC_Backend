/** Delete all message */

 var fs = require('fs-extra');
var _ = require('lodash');
var sha1 = require('sha1');
var http = require('http');
var Stream = require('stream').Transform;
var async = require('async');

var DatabaseManager = require('../server/lib/DatabaseManager');
var UserModel = require('../server/Models/User');

var Utils = require('../server/lib/utils');
var init = require('../server/lib/init');
var Const = require('../server/lib/consts');

var ConversationModel = require('../server/Models/Conversation');
var SpikaMessageModel = require('../server/Models/Spika/Message');
var LogDeleteMessage = require('../server/Models/LogDeleteMessage');

DatabaseManager.init(function(success){
        
    if(!success){
        
        console.log('Failed to connect DB');
        process.exit(1);
        
    } else {
                
        var responseData = {};
        var conversationModel = ConversationModel.get();
        var logDeleteMessage = LogDeleteMessage.get();
        var spikaMessageModel = DatabaseManager.getModel("Spika/Message").model;
                
        // get all conversation
        async.waterfall([
        
            function(done){
                
                conversationModel.find({},function(err,conversationResult){
                    
                    if(err){
                        done(err,null);
                        return;
                    }
                        
                    responseData.conversations = conversationResult;
                    done(err,responseData);
                    
                });
                
            },
            function(result,doneWaterFall){
                
                responseData.messagesToDelete = [];
                
                async.each(result.conversations,function(conversation,done){
                                        
                    // search messages
                    spikaMessageModel.find({roomID:conversation._id},function(err,messageResult){
                        
                        _.forEach(messageResult,function(message){
                                                        
                            var seenUsersCount = message.seenBy.length;
                            var usersInCouversation = conversation.users.length;
                                                        
                            if(seenUsersCount == usersInCouversation - 1){
                                
                                responseData.messagesToDelete.push(message);
                                                                
                            }
                                                         
                        });
                          
                        done();
                                                                      
                    });
                    
                    
                },function(err,result){
                    
                   doneWaterFall(err,responseData);
                    
                });
                
                
            },
            
            function(result,doneWaterFall){
                
                async.each(responseData.messagesToDelete,function(message,done){

                    message.remove();
                    
                    // insert to log
                    var logModel = new logDeleteMessage({
                        messageId: message._id,
                        conversationId: message.roomID,
                        created:  Utils.now()
                    });
                                                        
                    logModel.save(function(err,resultSaveLog){
                        

                        done();
                        
                    });
                                
                },function(err,result){
                    
                    doneWaterFall(err,responseData);
                    
                });
                                
            }
            
        ],function(err,result){
            
            if(err){
                console.log("Ended with errors",err);
                process.exit(1);
            }
            
            console.log("Ended successfully");
            process.exit(1);
            
        });
        
    }
    
});
