/**  Update history when new message comes */

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

var PermissionLogic = require('./Permission');

var UpdateHistory = {
    
    resetUnreadCount: function(obj){

        var rawRoomId = obj.roomID;
        var userId = obj.userID;
        
        if(_.isEmpty(rawRoomId) ||
            _.isEmpty(userId))
            
            return;
        
        var roomIdSplitted = rawRoomId.split('-');
        var roomType = roomIdSplitted[0];
        var historyModel = HistoryModel.get();
        
        var chatId = "";
        
        // private chat
        if(roomType == Const.chatTypePrivate){
            
            if(roomIdSplitted.length != 3)
                return;
            
            // roomId = 1-user1-user2 user1: which has lower created timestamp
            
            var user1 = roomIdSplitted[1];
            var user2 = roomIdSplitted[2];
            var toUserId = "";
            
            if(user1 == userId){
                toUserId = user2;
            }else{
                toUserId = user1;
            }
            
            chatId = toUserId;
            
        }

        // group chat
        if(roomType == Const.chatTypeGroup){
            
            if(roomIdSplitted.length != 2)
                return;
                
           chatId = roomIdSplitted[1];

            
        }
        
        // room chat
        if(roomType == Const.chatTypeRoom){

            if(roomIdSplitted.length != 2)
                return;
                
           chatId = roomIdSplitted[1];

            
        }

        async.waterfall([function(done){
            
            var result = {};
            
            // search history object
            historyModel.findOne({
                userId:userId,
                chatId:chatId
            },function(err,findResult){
                
                result.historyObj = findResult;
                done(err,result);
                
            });
            
        },
        function(result,done){
            
            if(result.historyObj){

                result.historyObj.update({
                    unreadCount : 0,
                    lastUpdateUnreadCount: Utils.now()
                },{},function(err,updateResult){
                    
                    done(err,result);
                    
                });
            
            }

        }],
        function(err,result){
            
        });
          
    },
    updateByMessage: function(obj,callBack){

        var rawRoomId = obj.roomID;
        var userId = obj.userID;
        var messageId = obj._id;
        
        if(_.isEmpty(rawRoomId) ||
            _.isEmpty(userId) ||
            _.isEmpty(messageId))
            
            return;

        var roomIdSplitted = rawRoomId.split('-');
        var roomType = roomIdSplitted[0];
        
        // private chat
        if(roomType == Const.chatTypePrivate){
            
            if(roomIdSplitted.length != 3)
                return;
            
            // roomId = 1-user1-user2 user1: which has lower created timestamp
            
            var user1 = roomIdSplitted[1];
            var user2 = roomIdSplitted[2];
            var fromUserId = userId;
            var toUserId = "";
            
            if(user1 == userId){
                toUserId = user2;
            }else{
                toUserId = user1;
            }
            
            this.updateByPrivateChat(fromUserId,toUserId,obj,() => {
                if(callBack)
                    callBack();
            });
            
        }

        // group chat
        if(roomType == Const.chatTypeGroup){
            
            if(roomIdSplitted.length != 2)
                return;
                
           var groupId = roomIdSplitted[1];
           var fromUserId = userId;
           
           this.updateByGroupChat(fromUserId,groupId,obj,() => {
                if(callBack)
                    callBack();
            });
            
        }
        
        // room chat
        if(roomType == Const.chatTypeRoom){

            if(roomIdSplitted.length != 2)
                return;
                
           var roomId = roomIdSplitted[1];
           var fromUserId = userId;
           
           this.updateByRoomChat(fromUserId,roomId,obj,() => {
                if(callBack)
                    callBack();
            });
            
        }
        
    },
    
    newRoom: function(roomObj){
        
        var self = this;
        
        if(_.isEmpty(roomObj.users) ||
            _.isEmpty(roomObj._id))
            
            return;
            
        async.each(roomObj.users,function(userId,done){
            
            var historyData = {
                userId : userId,
                chatId : roomObj._id,
                chatType : Const.chatTypeRoom,
                lastUpdate : Utils.now(),
                lastUpdateUser : null,
                lastMessage : null
            }
            
            self.updateData(historyData,null,function(err,updateResult){

                done(null);

            });

        },function(err){
            
            
        });
          
    },
    updateByPrivateChat: function(fromUserId,toUserId,rawMessageObj,callBack){
        
        var self = this;
        
        var userModel = UserModel.get();

        async.waterfall([
            function(done){

                var result = {
                    message: {
                        messageId: rawMessageObj._id.toString(),
                        message: rawMessageObj.message,
                        created: rawMessageObj.created,
                        type: rawMessageObj.type
                    }
                };
        
                userModel.findOne({_id:fromUserId},UserModel.defaultResponseFields,function(err,findUserResult){
                    
                    result.fromUser = findUserResult;
                    done(err,result);
                    
                });
                
            },
            function(result,done){

                // update for fromUser
                var historyData = {
                    userId : fromUserId,
                    chatId : toUserId,
                    chatType : Const.chatTypePrivate,
                    lastUpdate : Utils.now(),
                    lastUpdateUser : result.fromUser,
                    lastMessage : result.message
                }
                
                self.updateData(historyData,rawMessageObj,function(err,updateResult){
                    
                    done(err,result);
                    
                });

            },
            function(result,done){

                // update for toUser
                var historyData = {
                    userId : toUserId,
                    chatId : fromUserId,
                    chatType : Const.chatTypePrivate,
                    lastUpdate : Utils.now(),
                    lastUpdateUser : result.fromUser,
                    lastMessage : result.message
                }
                
                self.updateData(historyData,rawMessageObj,function(err,updateResult){
                    
                    done(err,result);
                    
                });

            }
            
            
        ],function(err,result){
            
            if(err){
                console.log("Logic Error: UpdateHistory",err);
                return;
            }

            if(callBack)
                callBack();
            
        });
        
    },
    updateByRoomChat: function(fromUserId,roomId,rawMessageObj,callBack){
        
        var self = this;
        
        var userModel = UserModel.get();
        var roomModel = RoomModel.get();
        
        async.waterfall([
            function(done){

                var result = {
                    message: {
                        messageId: rawMessageObj._id.toString(),
                        message: rawMessageObj.message,
                        created: rawMessageObj.created,
                        type: rawMessageObj.type
                    }
                };
                
                console.log('roomId',roomId);

                // get room
                roomModel.findOne({_id:roomId},function(err,findRoomResult){
                    
                    if(findRoomResult == null){
                        done('invalid room id',roomId);
                        return;
                    }
                    
                    result.room = findRoomResult;
                    done(err,result);
                    
                });
                
            },
            function(result,done){
                
                userModel.findOne({_id:fromUserId},
                    UserModel.defaultResponseFields,
                    function(err,findUserResult){
                    
                    result.fromUser = findUserResult;
                    done(null,result);
                    
                });
                
            },
            function(result,done){

                if(!_.isArray(result.room.users)){
                    done('empty room',null);
                    return;
                }

                async.each(result.room.users,function(userId,doneEach){
                    
                    var historyData = {
                        userId : userId,
                        chatId : roomId,
                        chatType : Const.chatTypeRoom,
                        lastUpdate : Utils.now(),
                        isUnread: 1,
                        lastUpdateUser : result.fromUser,
                        lastMessage : result.message
                    }
                    
                    self.updateData(historyData,rawMessageObj,function(err,updateResult){
                        
                        doneEach(err,result);
                        
                    });
                    
                    
                },function(err){

                    done(err,result);
                })
                

            }
            
            
        ],function(err,result){
            
            if(err){
                console.log("Logic Error: UpdateHistory",err);
                return;
            }

            if(callBack)
                callBack();

        });
        
    },

    updateByGroupChat: function(fromUserId,groupId,rawMessageObj,callBack){
        
        var self = this;
        
        var userModel = UserModel.get();
        var groupModel = GroupModel.get();

        async.waterfall([

            function(done){

                var result = {
                    message: {
                        messageId: rawMessageObj._id.toString(),
                        message: rawMessageObj.message,
                        created: rawMessageObj.created,
                        type: rawMessageObj.type
                    }
                };
            
                // get group
                groupModel.findOne({_id:groupId},function(err,findGroupResult){
                    
                    if(findGroupResult == null){
                        done('invalid group id',null);
                        return;
                    }
                    
                    result.group = findGroupResult;
                    done(err,result);
                    
                });
                
            },
            function(result,done){
                
                userModel.findOne({_id:fromUserId},UserModel.defaultResponseFields,function(err,findUserResult){
                    
                    result.fromUser = findUserResult;
                    done(err, result);
                    
                });
                
            },
            function(result, done) {

                // when hook fromUser doesn't exit
                if(!result.fromUser){
                    done("hook", result);
                    return;
                }

                // get above departments
                PermissionLogic.getAboveDepartments(result.fromUser.organizationId, groupId, (departmentIds) => {

                    result.departmentIds = departmentIds;
                    done(null, result);
                    
                });

            },
            function(result, done) {
                
                // get users of above departments
                userModel.find({
                    groups: { $in: result.departmentIds }
                }, { 
                    _id: 1 
                }, (err, findResult) => {
        
                    result.departmentUsers = _.pluck(findResult, "_id");
                    done(err, result);
                    
                });
                
            },
            function(result, done) {
                       
                var groupUsers = _.compact(_.union(result.group.users.toString().split(","), result.departmentUsers.toString().split(",")));

                async.each(groupUsers, function(userId, doneEach) { 
                    
                    var historyData = {
                        userId : userId,
                        chatId : groupId,
                        chatType : Const.chatTypeGroup,
                        lastUpdate : Utils.now(),
                        isUnread: 1,
                        lastUpdateUser : result.fromUser,
                        lastMessage : result.message
                    };
                    
                    self.updateData(historyData, rawMessageObj, function(err, updateResult) {
                        
                        doneEach(err,result);
                        
                    });
                    
                }, function(err){
                    
                    done(err,result);
                })
                                        
            }                    
        ],
        function(err,result){
            
            if(err == "hook"){
                return;
            }
            else if(err){
                console.log("Logic Error: UpdateHistory",err);
                return;
            }

            if(callBack)
                callBack();
                
        });
        
    },
    
    updateData: function(data,rawMessageObj,callBack){
        
        var historyModel = HistoryModel.get();
        
        async.waterfall([function(done){
                
                var result = {};
                
                historyModel.findOne({
                    userId:data.userId,
                    chatId:data.chatId
                },function(err,findResult){
                    
                    result.existingData = findResult;
                    done(null,result);
                    
                });
                
            },
            function(result,done){
                
                done(null,result);
                
            },
            function(result,done){

                if(rawMessageObj){
                    
                    if(!rawMessageObj || (result.isOnline && result.currentRoomID == rawMessageObj.roomID)){

                    }else{
                        
                        if(!result.existingData || result.existingData.unreadCount == undefined || result.existingData.unreadCount == null)
                            data.unreadCount = 1;
                        else  if(rawMessageObj && data.userId != rawMessageObj.userID)   
                            data.unreadCount = result.existingData.unreadCount + 1;
    
                    }
                    
                }
                
                if(result.existingData){
                    
                    result.existingData.update(data,{},function(err,updateResult){
                        
                        done(err,result);
                        
                    });
                    
                }else{

                    var model = new historyModel(data);
                
                    model.save(function(err,insertResult){
                        
                        result.history = insertResult;
                        done(err,result);
                        
                    });
                    
                }
                
            }
        ],
        function(err,result){

            callBack(err,result);
            
        });

    }
};


module["exports"] = UpdateHistory;