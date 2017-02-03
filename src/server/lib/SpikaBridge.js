/** Here is everything about Spika */

var mongoose = require('mongoose');
var _ = require('lodash');
var spika = require('../../../modules_customised/spika');
var async = require('async');

var Const = require('./consts.js');
var Conf = require('./init.js');
var Utils = require('./utils.js');

var DatabaseManager = require('./DatabaseManager');
var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');
var UserModel = require('../Models/User');
var FavoriteModel = require('../Models/Favorite');
var EncryptionManager = require('./EncryptionManager');
var HistoryModel = require('../Models/History');
var RoomModel = require( '../Models/Room');

var UpdateHistoryLogic = require('../Logics/UpdateHistory');
var NotifyNewMessage = require('../Logics/NotifyNewMessage');
var UpdateOrganizationDiskUsageLogic = require("../Logics/UpdateOrganizationDiskUsage");

var SocketAPIHandler = require("../SocketAPI/SocketAPIHandler");

var SpikaBridge = {
    
    SpikaServer: null,
    init:function(app,io,customConfig){
        
        var self = this;
        
        if(customConfig)
            Conf = customConfig;
        
        this.SpikaServer = new spika(app,io,{
        
            config:{
                chatDatabaseUrl : Conf.databaseUrl,
                port: Conf.port,
                uploadDir: Conf.uploadPath,
                imageDownloadURL: "/spika/media/images/",
                noavatarImg: "/spika/img/noavatar.png",
                urlPrefix: '/spika',
                sendAttendanceMessage: false,
                redis:Conf.redis,
                socketNameSpace: '/spika',
                protocol: Conf.protocol
            },
            listeners:{
        
                onNewMessage:function(obj){

                    if (obj.file) {

                        UserModel.getUserById(obj.user.userID, (findResult) => {
                        
                            if (findResult) {

                                var size = obj.file.file.size;

                                if (obj.file.thumb)
                                    size += obj.file.thumb.size;

                                UpdateOrganizationDiskUsageLogic.update(findResult.organizationId, size);

                            }
                             
                        });

                    }

                    UpdateHistoryLogic.updateByMessage(obj);
                    NotifyNewMessage.notify(obj);                    
                    
                },
                onNewUser:function(obj){
        
                    
                },
                OnUserTyping:function(obj){
        
        
                },
                OnMessageChanges:function(obj){
                    
                    var message = obj[0];

                    if(message && message.deleted && message.deleted != 0){

                        var favoriteModel = FavoriteModel.get();
                        
                        // delete from favorite
                        favoriteModel.remove({
                            messageId:message._id
                        },function(err,result){

                        })

                    }else{



                    }
                    
                },
                OnOpenRoom:function(obj){
        
                    DatabaseManager.redisSaveValue(Const.redisKeyCurrentRoomId + obj.userID,obj.roomID);
                    UpdateHistoryLogic.resetUnreadCount(obj);

                },OnCloseRoom:function(obj){
                    
                    if(obj && obj.roomID && obj.user){
                        DatabaseManager.redisSaveValue(Const.redisKeyCurrentRoomId + obj.user.userID,"");
                    }
                    
                }
        
            },
            hooks : {

                encryptMessage : function(text){
                    
                    return EncryptionManager.encryptText(text);

                },

                decryptMessage : function(text){
                    
                    return EncryptionManager.decryptText(text);

                },

                sendMessage : function(param,callBack){

                    var userModel = UserModel.get();
                    var roomModel = RoomModel.get();

                    var messageTargetTypeAry = param.roomID.split("-");

                    if(messageTargetTypeAry.length < 2){
                        callBack({
                            canSend: false
                        });

                        return;
                    }

                    var messageTargetType = messageTargetTypeAry[0];

                    if(messageTargetType == 1){

                        var isBlocked = false;

                        var userIdFrom = param.userID;
                        var splitted = param.roomID.split("-");
                        if(splitted.length > 2){

                            var userIdTo = splitted[1];
                            if(userIdTo == userIdFrom)
                                userIdTo = splitted[2];
                            
                        }

                        async.waterfall([(done) => {
                            
                            var result = {};
                            
                            /*
                            userModel.findOne({_id:userIdFrom},function(err,findResult){
                                result.userFrom = findResult;
                                done(err,result)
                            });
                            */

                            done(null,result);

                        },
                        (result,done) => {

                            userModel.findOne({_id:userIdTo},function(err,findResult){
                                result.userTo = findResult.toObject();
                                done(err,result)
                            });
                        }
                        ],
                        function(err,result){

                            if(_.isArray(result.userTo.blocked) &&
                                result.userTo.blocked.indexOf(userIdFrom) != -1)
                                isBlocked = true;
                            
                            if(isBlocked){
                                SocketAPIHandler.emitToUser(param.userID,'socketerror', {code:Const.responsecodeMessageNoPermission})
                            }

                            callBack({
                                canSend: !isBlocked
                            });

                        });
                        
                    }

                    else if(messageTargetType == 2){

                        userModel.findOne({_id:param.userID},function(err,findResult){
                            
                            var groups = findResult.groups;
                            var toGroupId = messageTargetTypeAry[1];
                            var canSend = groups.indexOf(toGroupId) != -1;

                            if(!canSend){
                                SocketAPIHandler.emitToUser(param.userID,'socketerror', {code:Const.responsecodeMessageNoPermission});
                            }

                            callBack({
                                canSend: canSend
                            });
                            
                        });

                    }

                    else if(messageTargetType == 3){

                        var roomId = messageTargetTypeAry[1];

                        roomModel.findOne({_id:roomId},function(err,findResult){
                            
                           if(err || !findResult){

                                SocketAPIHandler.emitToUser(param.userID,'socketerror', {code:Const.responsecodeMessageNoPermission});

                                callBack({
                                    canSend: false
                                }); 

                                return;
                            }

                            var canSend = findResult.users.indexOf(param.userID) != -1;

                            if(!canSend){
                                SocketAPIHandler.emitToUser(param.userID,'socketerror', {code:Const.responsecodeMessageNoPermission});
                            }
                            
                            callBack({
                                canSend: canSend
                            });
                            
                        });


                    }

                    else{
                        callBack({
                            canSend: true
                        }); 
                    }

                },
                typing : function(param,callBack){

                    callBack({
                        canSend: true
                    });

                },
                
                stickerURL: function(param,callBack){
                    
                   var model = UserModel.get();
                   
                   model.findOne({_id:param.userID},function(err,findResult){
                    
                        if(findResult){
                            var url = Conf.urlPrefix + "api/v2/stickers/" + findResult.organizationId;
                            if(callBack)
                                callBack(url);
                        }else{
                            callBack(null);
                        }

                         
                   });
                   
                },

                deleteMessage: function(message,callBack){

                    // delete from history
                    var historyModel = HistoryModel.get();

                    historyModel.update(
                        { "lastMessage._id": message._id },
                        { "lastMessage.message": "" },

                    function(err, updateResult) {

                        callBack(err, updateResult);

                    });     

                }

            }

        
        });
                
    },
    onNewMessage : function(obj){
        

    },
    OnUserEnterChat: function(obj){
        

    },
    sendNewMessage: function(user,conversationId,text,callBack){
        
                        
    },
    
    checkPermission : function(userID,conversationID,callBack){
        
                    
        
    }

}

module["exports"] = SpikaBridge;
