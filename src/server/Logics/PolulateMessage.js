/** Send message model and populate with user,group and room */

var _ = require('lodash');
var async = require('async');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var Utils = require("../lib/utils");

var DatabaseManager = require("../lib/DatabaseManager");

var UserModel = require('../Models/User');
var RoomModel = require('../Models/Room');
var GroupModel = require('../Models/Group');
var HistoryModel = require('../Models/History');

var PolulateMessage = {
    
    populateEverything : function(messageList,callerUser,callBack){
        
        if(!messageList)
            callBack(messageList);
            
        if(!_.isArray(messageList))
            callBack(messageList)
        
        var userModel = UserModel.get();
        var groupModel = GroupModel.get();
        var roomModel = RoomModel.get();
        
        async.waterfall([function(done){
            
            // fetch users
            var result = {};
            var userIds = [];
            
            var roomIds = _.pluck(messageList,"roomID");
            
            _.forEach(roomIds,function(roomID){
                
                var splited = roomID.split('-');
                
                if(splited[0] == Const.chatTypePrivate){
                    
                    if(splited.length > 2){
                        
                        if(Utils.isObjectId(splited[1]))
                            userIds.push(splited[1]);

                        if(Utils.isObjectId(splited[2]))
                            userIds.push(splited[2]);

                    }
                    
                }
                 
            });
            
            userIds = userIds.concat(_.pluck(messageList,"userID"));
            userIds = _.unique(userIds);
            userIds = _.filter(userIds,function(objectID){
                
                // kick wrong id
                return Utils.isObjectId(objectID);
                 
            });
            
            userModel.find({
                _id:{$in:userIds}
            },function(err,findResult){
                
                if(err)
                    console.log(err);
                    
                result.users = findResult;
                done(err,result)
                
            });

        },
        function(result,done){
            
            // fetch groups
            var chats = _.filter(messageList,function(messageModel){
                
                var regex = new RegExp("^" + Const.chatTypeGroup + "-");
                
                return regex.test(messageModel.roomID);
                
            });
            
            var groupIds = _.map(_.pluck(chats,"roomID"),function(roomID){
                
                return Utils.getObjectIdFromRoomID(roomID);
                 
            });
            
            groupIds = _.filter(groupIds,function(objectID){
                
                // kick wrong id
                return Utils.isObjectId(objectID);
                 
            });
            
            groupModel.find({
                _id:{$in:groupIds}
            },function(err,findResult){

                if(err)
                    console.log(err);
                    
                result.groups = findResult;
                done(err,result);
                
            });
            
            
        },
        function(result,done){
            
            // fetch rooms
            var chats = _.filter(messageList,function(messageModel){
                
                var regex = new RegExp("^" + Const.chatTypeRoom + "-");
                
                return regex.test(messageModel.roomID);
                
            });
            
            var roomIds = _.map(_.pluck(chats,"roomID"),function(roomID){
                
                return Utils.getObjectIdFromRoomID(roomID);
                 
            });

            roomIds = _.filter(roomIds,function(objectID){
                
                // kick wrong id
                return Utils.isObjectId(objectID);
                 
            });
            
            roomModel.find({
                _id:{$in:roomIds}
            },function(err,findResult){


                if(err)
                    console.log(err);
                    
                result.rooms = findResult;
                done(err,result);
                
            });
            
            
        },
        function(result,done){
            
            var newMessageList = _.map(messageList,function(message){
                
                // search user
                message.user = _.find(result.users,function(user){
                    
                    return user._id.toString() == message.userID;
                     
                });
                
                var roomType = message.roomID.split("-")[0];

                if(roomType == Const.chatTypePrivate){
                    
                    var roomIDSplitted = message.roomID.split("-");
                    
                    if(roomIDSplitted.length > 2){
                        
                        var user1 = roomIDSplitted[1];
                        var user2 = roomIDSplitted[2];
                        
                        var targetUserId = user1;
                        if(callerUser){
                            if(callerUser._id == user1)
                                targetUserId = user2;
                        }else{
                            callerUser = message.userID;
                        }

                        message.userModelTarget = _.find(result.users,function(user){
                            
                            return user._id.toString() == targetUserId;
                            
                        });
                    
                    }
                    
                }
                
                if(roomType == Const.chatTypeGroup){
                    
                    message.groupModel = _.find(result.groups,function(group){
                        
                        return group._id.toString() == Utils.getObjectIdFromRoomID(message.roomID);
                         
                    });
                    
                }

                if(roomType == Const.chatTypeRoom){
                    
                    message.roomModel = _.find(result.rooms,function(room){
                        
                        return room._id.toString() == Utils.getObjectIdFromRoomID(message.roomID);
                         
                    });
                    
                }
                
                return message;
                
            });
            
            result.newMessageList = newMessageList;
            
            done(null,result);
            
        }
        ],
        function(err,result){
            
            if(err){
                console.log(err);
                callBack(null);
            }
                
            else
                callBack(result.newMessageList);
            
        });

    }
    
}


module["exports"] = PolulateMessage;