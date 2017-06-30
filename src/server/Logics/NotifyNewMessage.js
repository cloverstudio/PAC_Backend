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

var PolulateMessageLogic = require('./PolulateMessage');
var TotalUnreadCount = require('./TotalUnreadCount');
var PushNotificationSender = require('./PushNotificationSender');

var HookModel = require('../Models/Hook');
var UserModel = require('../Models/User');
var RoomModel = require('../Models/Room');
var GroupModel = require('../Models/Group');
var HistoryModel = require('../Models/History');

var NotifyNewMessage = {
    
    notify: function(obj){

        var chatType = obj.roomID.split("-")[0];
        var roomIDSplitted = obj.roomID.split("-");
        
        if(roomIDSplitted.length < 2)
            return;
       
        async.waterfall([
            
            function(done){
                
                var result = {};
                
                if(chatType == Const.chatTypeGroup){
                    
                    var model = GroupModel.get();
                    
                    model.findOne({
                        
                        _id : roomIDSplitted[1]
                        
                    },function(err,findResult){
                        
                        result.group = findResult;
                        obj.group = findResult;
                        done(err,result);
                        
                    });
                    
                }else if(chatType == Const.chatTypeRoom){
                    
                    var model = RoomModel.get();
                    
                    model.findOne({
                        
                        _id : roomIDSplitted[1]
                        
                    },function(err,findResult){
                        
                        result.room = findResult;
                        obj.room = findResult;
                        done(err,result);
                        
                    });
                    
                }else{
                    
                    done(null,result);
                    
                }
                
            },
            function(result,done){
                
                var userModel = UserModel.get();
                
                userModel.findOne({
                    _id: obj.userID
                },function(err,findUserResult){
                    
                    if(!findUserResult && obj.userID.indexOf(Const.botUserIdPrefix) == -1){
                        done("invalid user id",result);
                        return;
                    }
                    
                    result.sender = findUserResult;

                    if(obj.userID.indexOf(Const.botUserIdPrefix) != -1){

                    }else{
                        obj.user = findUserResult;
                    }
                    
                    done(null,result);
                    
                });
                  
            },
            function(result,done){
                
                // make clone to handle encryption
                var messageCloned = _.clone(obj);

                if(messageCloned.type == Const.messageTypeText){
                    var encryptedMessage = EncryptionManager.encryptText(messageCloned.message);
                    messageCloned.message = encryptedMessage;
                }

                // websocket notification
                if(chatType == Const.chatTypeGroup){
                    
                    messageCloned.group = result.group;
                    SocketAPIHandler.emitToRoom(messageCloned.roomID,'newmessage',messageCloned);
                    
                    done(null,result);
                    
                } else if(chatType == Const.chatTypeRoom) {
                    
                    messageCloned.room = result.room;
                    SocketAPIHandler.emitToRoom(messageCloned.roomID,'newmessage',messageCloned);

                    done(null,result);
                    
                } else if(chatType == Const.chatTypePrivate){
                    
                    var splitAry = messageCloned.roomID.split("-");
                    
                    if(splitAry.length < 2)
                        return;
                    
                    var user1 = splitAry[1];
                    var user2 = splitAry[2];
                    
                    var toUser = null;
                    var fromUser = null;

                    if(user1 == obj.userID){
                        toUser = user2;
                        fromUser = user1;
                    }else{
                        toUser = user1;
                        fromUser = user2;
                    }
                    var muteNotification = false;

                    
                    result.toUserId = toUser;

                    var userModel = UserModel.get();

                    userModel.find({
                        _id:result.toUserId
                    },function(err,findUserResult){
                        
                        result.users = findUserResult;

                        if(!findUserResult)
                            return;

                        var toUserObj = result.users[0].toObject();

                        if(result.sender && _.isArray(toUserObj.muted)){
                            
                            if(toUserObj.muted.indexOf(result.sender._id.toString()) != -1)
                                muteNotification = true;

                        }

                        // send to my self
                        DatabaseManager.redisGet(Const.redisKeyUserId + fromUser,function(err,redisResult){
                            
                            var socketIds = _.pluck(redisResult,"socketId");
                            
                            if(!_.isArray(redisResult))
                                return;
                            
                            _.forEach(redisResult,function(socketIdObj){
                                SocketAPIHandler.emitToSocket(socketIdObj.socketId,'newmessage',messageCloned);
                            })
                            
                        });

                        // send to user who got message
                        DatabaseManager.redisGet(Const.redisKeyUserId + toUser,function(err,redisResult){
                            
                            var socketIds = _.pluck(redisResult,"socketId");
                            
                            if(!_.isArray(redisResult))
                                return;
                            
                            if(muteNotification)
                                messageCloned.muted = 1;

                            _.forEach(redisResult,function(socketIdObj){
                                SocketAPIHandler.emitToSocket(socketIdObj.socketId,'newmessage',messageCloned);
                            })
                            
                        });
                        
                        done(null,result);
                        
                    });

                }

            },
            function(result,done){
                
                var userModel = UserModel.get();
                var message = "";
                
                // start sending push notification
                if(chatType == Const.chatTypeGroup){

                    if(result.sender){
                        message = result.sender.name + " posted new message to " + obj.group.name;
                    }else{
                        message = "New message to " + obj.group.name;
                    }

                    userModel.find({
                        $and : [
                            {_id:{ $in : obj.group.users}},
                            {_id:{$ne : obj.userID}}
                        ]
                    },function(err,findUserResult){
                        
                        result.users = findUserResult;
                        result.pushMessage = message;
                        
                        done(null,result);
                        
                    });
                    
                } else if(chatType == Const.chatTypeRoom) {
                    
                    if(result.sender){
                        message = result.sender.name + " posted new message to " + obj.room.name;
                    }else{
                        message = "New message to " + obj.room.name;
                    }
                   
                    
                    userModel.find({
                        $and : [
                            {_id:{ $in : obj.room.users}},
                            {_id:{$ne : obj.userID}}
                        ]
                    },function(err,findUserResult){
                        
                        result.users = findUserResult;
                        result.pushMessage = message;
                        
                        done(null,result);
                        
                    });
                    
                } else if(chatType == Const.chatTypePrivate){

                    if(result.sender){
                        message = result.sender.name + ": " + obj.message;
                    }else{
                         message = " New message: " + obj.message;
                    }
                    
                   result.pushMessage = message;
                   
                   done(null,result);

                }
                
            },
            function(result,done){
                
                var usersOffline = [];
                
                /*
                async.each(result.users,function(user,doneEach){
                    
                    // remove online users
                    DatabaseManager.redisGetValue(Const.redisKeyOnlineStatus + user._id.toString(),function(err,isUserOnline){
                        
                        if(!isUserOnline)
                            usersOffline.push(user);
                        
                        doneEach(null);
                        
                    });
                
                },function(err){
                    
                    result.offlineUsers = usersOffline;
                    done(null,result);
                    
                });
                */

                result.offlineUsers = result.users;
                done(null,result);
                
            },
            function(result,done){
                
                var unreadCountAry = [];
                
                async.each(result.offlineUsers,function(user,doneEach){
                    
                    TotalUnreadCount.get(user._id.toString(),function(err,count){
                        
                        unreadCountAry[user._id.toString()] = count;
                        
                        doneEach(null);
                        
                    });
                    
                
                },function(err){
                    
                    result.unreadCountAry = unreadCountAry;
                    done(null,result);
                    
                });
                

                
            },
            function(result,done){
                
                // fetch information
                PolulateMessageLogic.populateEverything([obj],null,function(newData){
                    
                    if(newData)
                        result.message = newData[0];
                        
                    done(null,result);
                        
                });

                
            },
            function(result,done){

                // send push token
                
                var tokenAndBadgeCount = [];
                
                _.forEach(result.offlineUsers,function(row){
                    
                    row = row.toObject();
                    
                    var badgeCount = 0;
                    
                    if(result.unreadCountAry[row._id.toString()])
                        badgeCount = result.unreadCountAry[row._id.toString()];
                    
                    
                    var mutedList = row.muted;
                    var isMuted = false;
                    var targetId = null;

                    if(chatType == Const.chatTypeGroup){
                        targetId = obj.group._id.toString();
                    }else if(chatType == Const.chatTypeRoom){
                        targetId = obj.room._id.toString();
                    }else{
                        targetId = obj.user._id.toString();
                    }

                    if(_.isArray(mutedList)){

                        if(mutedList.indexOf(targetId) != -1)
                            isMuted = true;

                    }

                    if(!isMuted){

                        _.forEach(row.pushToken,function(token){
                            
                            tokenAndBadgeCount.push({
                                badge: badgeCount,
                                token: token
                            });
                            
                        });

                    }
                        
                });
                
                var avatarURL = "/api/v2/avatar/user/";

                if(obj.user && obj.user.avatar && obj.user.avatar.thumbnail)
                    avatarURL +=obj.user.avatar.thumbnail.nameOnServer;
                
                var name = "";
                
                if(obj.user && obj.user.name)
                    name = obj.user.name;
                
                 var message = obj.message;

                 if(obj.type == Const.messageTypeFile){
                     message = " Sent file";
                 }

                 if(obj.type == Const.messageTypeLocation){
                     message = " Shared location";
                 }

                 if(obj.type == Const.messageTypeContact){
                     message = " Shared contact";
                 }

                 if(obj.type == Const.messageTypeSticker){
                     message = " Sent sticker";
                 }

                 var payload = {
                    roomId:obj.roomID,
                    message: {
                        id:obj._id.toString(),
                        message:obj.message,
                        messageiOS: name + ":" + message,
                        type: obj.type
                    },
                    from: {
                        id:obj.userID,
                        name:name,
                        thumb:avatarURL
                    }
                };
                
                if(obj.file){
                    payload.file = obj.file.file;
                }
                
                if(obj.location){
                    payload.location = obj.location;
                }
                
                if(obj.group){
                
                    var avatarURL = "/api/v2/avatar/group/";

                    if(obj.group.avatar && obj.group.avatar.thumbnail)
                        avatarURL += obj.group.avatar.thumbnail.nameOnServer;

                    payload.group = {
                        id:obj.group._id.toString(),
                        name:obj.group.name,
                        thumb:avatarURL
                    }

                    payload.message.messageiOS = obj.group.name + " - " + payload.message.messageiOS;
                }

                if(obj.room){
                
                    var avatarURL = "/api/v2/avatar/room/";

                    if(obj.room.avatar && obj.room.avatar.thumbnail)
                        avatarURL += obj.room.avatar.thumbnail.nameOnServer;

                    payload.room = {
                        id:obj.room._id.toString(),
                        name:obj.room.name,
                        thumb:avatarURL
                    }

                    payload.message.messageiOS = obj.room.name + " - " + payload.message.messageiOS;
                }

                payload.pushType = Const.pushTypeNewMessage;
                PushNotificationSender.start(tokenAndBadgeCount,payload);

                done(null,result);

            },
            function(result,done){
                
                var room = result.room;
                var message = result.message;
                
                if(room){
                    
                    var hookModel = HookModel.get();

                    hookModel.find({
                        targetId: room._id,
                        hookType:Const.hookTypeOutgoing
                    },function(err,findResult){
                        
                        if(!findResult){
                            done(null,result);
                            return;
                        }
                        
                        result.hookTarget = findResult;
                        
                        done(err,result)
                        
                    });

                }else{
                    
                    done(null,result);
                }

                // send outgoing webhook
                
                
            },
            function(result,done){
                
                if(!result.hookTarget){
                    done(null,result);
                }
                
                async.each(result.hookTarget,function(hook,eachDone){
                    
                    var fromUser = result.message.user;
                    var message = result.message;
                    
                    var name = "";
                    var userId = "";
                    
                    if(fromUser){
                        name = fromUser.name;
                        userId = fromUser._id;
                    }
                    request({
                        url: hook.url,
                        method: "POST",
                        json: true,   // <--Very important!!!
                        body: { 
                            name: name,
                            userId: userId,
                            message: message.message,
                            identifier: message._id
                        },
                    }, function (error, response, body){
                        console.log(response);
                    });
                     
                },function(err){
                    
                    done(null,result);
                    
                });
                
                
            }
            
        ],
            
        function(err,result){

            if(err)
                return;
                

        });

        
    }
    
};


module["exports"] = NotifyNewMessage;