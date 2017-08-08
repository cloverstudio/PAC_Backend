/** call_request Socket API  */

var _ = require('lodash');
var async = require('async');

var DatabaseManager = require("../lib/DatabaseManager");
var SocketAPIHandler = require("./SocketAPIHandler");
var PushNotificationSender = require('../Logics/PushNotificationSender');

var Utils = require("../lib/utils");
var Const = require("../lib/consts");
var Config = require("../lib/init");

var GroupModel = require('../Models/Group');
var RoomModel = require('../Models/Room');
var UserModel = require('../Models/User');

var SocketHandlerBase = require("./SocketHandlerBase");

// default
if(Config.useVoipPush == undefined){
    Config.useVoipPush = true;
}

var CallingActionsHandler = function(){
    
}
_.extend(CallingActionsHandler.prototype,SocketHandlerBase.prototype);

CallingActionsHandler.prototype.attach = function(io,socket){
        
    var self = this;

    /**
     * @api {socket} "call_request" make call request
     * @apiName make call request
     * @apiGroup Socket 
     * @apiDescription Make call request
     * @apiParam {string} userId user id
     * @apiParam {string} mediaType 1: audio 2: video
     */
    socket.on('call_request', function(param){

        if(_.isNull(param.userId)){
            console.log('call_request socketerror', {code:Const.responsecodeCallingInvalidParamInvalidUserId});
            socket.emit('socketerror', {code:Const.responsecodeCallingInvalidParamInvalidUserId});
            return;
        }

        if(_.isNull(param.mediaType)){
            console.log('call_request socketerror', {code:Const.responsecodeCallingInvalidParamNoMediaType});
            socket.emit('socketerror', {code:Const.responsecodeCallingInvalidParamNoMediaType});
            return;
        }
        
        var userId = param.userId;
        
        console.log('call_request',param);

        async.waterfall([
            
            // get user socket ids
            function(done){
                
                var result = {};
                
		        // add socket id to the user
		        DatabaseManager.redisGet(Const.redisKeyUserId + userId,function(err,value){
		            
                    result.socketIds = value;
                    
                    done(null,result)
                    
		        });

            },
            function(result,done){
                
                // get from user model
		        DatabaseManager.redisGet(Const.redisKeySocketId + socket.id,function(err,value){
		            
                    result.userFrom = value;
                    
                    if(value){
                        done(null,result);
                    }else{
                        done("user error",result)
                    }
                    
		        });
                
            },

            function(result,done){

                var userIdFrom = result.userFrom._id;
                var userIdTo = userId;
                var userModel = UserModel.get();

                // check blocked
                userModel.findOne({
                    _id: userIdTo
                },function(err,findUserResult){
                    
                    if(err){
                        done("user error",result)
                        return;
                    }

                    if(!err){

                        if(findUserResult.blocked.indexOf(userIdFrom) != -1){

                            done('permission error',result);

                        }else{

                            done(null,result);

                        }
                            
                    }
                    
                });

            },
            function(result,done){

                var callId = Utils.getRandomString();

                // save to call queue for the case the user is offline
                DatabaseManager.redisSave(Const.redisCallQueue + "_" + userId + "_" + callId,{
                    user: result.userFrom,
                    mediaType: param.mediaType
                });

                setTimeout(function(){
                    self.deleteCallByCallId(callId);
                },30000);
                
                //console.log('timer created',self.disableCallLogTimer[userId]);

                var userModel = UserModel.get();
                
                userModel.findOne({
                    _id: userId
                },function(err,findUserResult){
                    
                    if(!err){

                        findUserResult = findUserResult.toObject();

                        var tokens = [];

                        if(findUserResult.pushToken && findUserResult.pushToken.length > 0){

                            findUserResult.pushToken.forEach((token) => {

                                if(Config.useVoipPush){

                                    // only android
                                    if(token.length > 64){
                                        tokens.push({
                                            badge: null,
                                            token: token
                                        });
                                    }

                                } else {

                                    tokens.push({
                                        badge: null,
                                        token: token
                                    });

                                }


                            });

                        }

                        if(Config.useVoipPush){
                            if(findUserResult.voipPushToken && findUserResult.voipPushToken.length > 0){
                                findUserResult.voipPushToken.forEach((token) => {
                                    tokens.push({
                                        badge: null,
                                        token: token
                                    });
                                });
                            }
                        }

                        if(tokens.length > 0){

                            if(result.userFrom){

                                var avatarFileName = "";
                                if(result.userFrom.avatar && result.userFrom.avatar.thumbnail)
                                    avatarFileName = result.userFrom.avatar.thumbnail.nameOnServer;

                                PushNotificationSender.start(tokens,{
                                    message: { 
                                        message : result.userFrom.name + " is calling.",
                                        messageiOS : result.userFrom.name + " is calling.",
                                    },
                                    pushType: Const.pushTypeCall,
                                    from: {
                                        _id:result.userFrom._id,
                                        name:result.userFrom.name,
                                        avatarFileName:avatarFileName
                                    }
                                },Config.useVoipPush);
                            }
                        }

                    }
                    
                });

                // send push notification


                done(null,result)
            }
        ],
        function(err,result){

            if(!err){

                Utils.stripPrivateData(result.userFrom);
                
                if(!result.socketIds || result.socketIds.length == 0){
                    console.log('call request send to no one');
                }   

                _.forEach(result.socketIds,function(socketInfo){
                    
                    console.log('call request send to ',socketInfo.socketId);

                    SocketAPIHandler.emitToSocket(socketInfo.socketId,"call_request",{
                        user: result.userFrom,
                        mediaType: param.mediaType
                    });
                
                });
            
            } else {

                console.log('call request faild',err);

                SocketAPIHandler.emitToSocket(socket.id,"call_failed",{
                    failedType: Const.callFaildUserBusy
                });
                
            }

        });
        
    });


   /**
     * @api {socket} "call_cancel" cancel call request
     * @apiName cancel call request
     * @apiGroup Socket 
     * @apiDescription cancel call request
     * @apiParam {string} userId user id
     */
    
    socket.on('call_cancel', function(param){

        if(_.isNull(param.userId)){
            console.log('call_cancel socketerror', {code:Const.responsecodeCallingInvalidParamInvalidUserId});
            socket.emit('socketerror', {code:Const.responsecodeCallingInvalidParamInvalidUserId});
            return;
        }

        console.log('call_cancel',param);

        var userId = param.userId;
        
        async.waterfall([
            
            // get user socket ids
            function(done){
                
                var result = {};
                
		        // add socket id to the user
		        DatabaseManager.redisGet(Const.redisKeyUserId + userId,function(err,value){
		            
                    result.socketIds = value;
                    
                    done(null,result)
                    
		        });

            },
            function(result,done){
                
                // delete from queue
                self.deleteCallByUserId(userId);

                done(null,result)
                
            },
            function(result,done){
                
                // get from user model
		        DatabaseManager.redisGet(Const.redisKeySocketId + socket.id,function(err,value){
		            
                    result.userFrom = value;
                    
                    done(null,result)
                    
		        });
                
            },
            function(result,done){

                var userModel = UserModel.get();

                userModel.findOne({
                    _id: userId
                },function(err,findUserResult){
                    
                    if(!err){

                        findUserResult = findUserResult.toObject();

                        var tokens = [];

                        if(findUserResult.pushToken && findUserResult.pushToken.length > 0){

                            findUserResult.pushToken.forEach((token) => {

                                if(Config.useVoipPush){

                                    // only android
                                    if(token.length > 64){
                                        tokens.push({
                                            badge: null,
                                            token: token
                                        });
                                    }

                                } else {

                                    tokens.push({
                                        badge: null,
                                        token: token
                                    });

                                }

                            });

                        }

                        if(Config.useVoipPush){

                            if(findUserResult.voipPushToken && findUserResult.voipPushToken.length > 0){

                                findUserResult.voipPushToken.forEach((token) => {
                                    tokens.push({
                                        badge: null,
                                        token: token
                                    });
                                });

                            }
                        
                        }

                        if(tokens.length > 0){

                            if(result.userFrom){

                                var avatarFileName = "";
                                if(result.userFrom.avatar && result.userFrom.avatar.thumbnail)
                                    avatarFileName = result.userFrom.avatar.thumbnail.nameOnServer;

                                PushNotificationSender.start(tokens,{
                                    message: { 
                                        message : result.userFrom.name + " hung up call." ,
                                        messageiOS : result.userFrom.name + " hung up call." 
                                    },
                                    pushType: Const.pushTypeCallClose,
                                    from: {
                                        _id:result.userFrom._id,
                                        name:result.userFrom.name,
                                        avatarFileName:avatarFileName
                                    }
                                },Config.useVoipPush);
                            }

                        }

                    }
                });

                done(null,result);
            },
        ],
        function(err,result){
            
            if(_.isEmpty(result.socketIds)){
                console.log('call cancel sent to no one');
            }else{
                
                _.forEach(result.socketIds,function(socketInfo){
                    
                    console.log('call cancel sent to ',socketInfo);

                    SocketAPIHandler.emitToSocket(socketInfo.socketId,"call_cancel",{
                    });
                
                });
                
            }
            
        });
        
    });
    
    
    /**
     * @api {socket} "call_reject" reject call request
     * @apiName reject call request
     * @apiGroup Socket 
     * @apiDescription reject call request
     * @apiParam {string} userId user id
     * @apiParam {string} rejectType 2: user busy 3: user declined
     */
    
    socket.on('call_reject', function(param){

        if(_.isNull(param.userId)){
            console.log('call_reject socketerror', {code:Const.responsecodeCallingInvalidParamInvalidUserId});
            socket.emit('socketerror', {code:Const.responsecodeCallingInvalidParamInvalidUserId});
            return;
        }

        if(_.isNull(param.rejectType)){
            console.log('call_reject socketerror', {code:Const.responsecodeCallingInvalidParamNoRejectType});
            socket.emit('socketerror', {code:Const.responsecodeCallingInvalidParamNoRejectType});
            return;
        }
        
        console.log('call_reject',param);

        var userId = param.userId;

        async.waterfall([
            
            // get user socket ids
            function(done){
                
                var result = {};
                
		        // add socket id to the user
		        DatabaseManager.redisGet(Const.redisKeyUserId + userId,function(err,value){
		            
                    result.socketIds = value;
                    
                    done(null,result)
                    
		        });

            },
            function(result,done){
                
                // get from user model
		        DatabaseManager.redisGet(Const.redisKeySocketId + socket.id,function(err,value){
		            
                    result.userFrom = value;
                    
                    done(null,result)
                    
		        });
                
                
            },
            function(result,done){
                
                // get from user sockets
		        DatabaseManager.redisGet(Const.redisKeyUserId + result.userFrom._id,function(err,value){
		            
                    result.userFromSockets = value;
                    
                    done(null,result)
                    
		        });
                
                
            }
        ],
        function(err,result){
            
            if(_.isEmpty(result.socketIds)){
                
                console.log('call_reject sent to no one');

                SocketAPIHandler.emitToSocket(socket.id,"call_failed",{
                    failedType: Const.callFaildOffline
                });
                
            }else{
                
                //Utils.stripPrivateData(result.userFrom);
                
                _.forEach(result.socketIds,function(socketInfo){
                    
                    SocketAPIHandler.emitToSocket(socketInfo.socketId,"call_failed",{
                        failedType: param.rejectType
                    });
                
                });

                _.forEach(result.userFromSockets,function(socketInfo){
                    
                    if(socketInfo.socketId != socket.id)
	                    SocketAPIHandler.emitToSocket(socketInfo.socketId,"call_reject_mine",{
							
	                    });
                
                });
                
            }
            
        });
        
    });

   /**
     * @api {socket} "call_received" send call_received to caller
     * @apiName call received
     * @apiGroup Socket 
     * @apiDescription send call_received to caller
     * @apiParam {string} userId user id
     */
    
    socket.on('call_received', function(param){

        if(_.isNull(param.userId)){
            console.log('call_received socketerror', {code:Const.responsecodeCallingInvalidParamInvalidUserId});
            socket.emit('socketerror', {code:Const.responsecodeCallingInvalidParamInvalidUserId});
            return;
        }


        console.log('call_received',param);

        // this userId is caller here
        var userId = param.userId;

        async.waterfall([
            
            // get user socket ids
            function(done){
                
                var result = {};
                
		        // get socket ids of the user
		        DatabaseManager.redisGet(Const.redisKeyUserId + userId,function(err,value){
		            
                    result.socketIds = value;
                    
                    done(null,result)
                    
		        });

            },
            function(result,done){
                
                // get from user model
		        DatabaseManager.redisGet(Const.redisKeySocketId + socket.id,function(err,value){
		            
                    // this userFrom is who received call
                    result.userFrom = value;
                    
                    done(null,result)
                    
		        });
                
            }
        ],
        function(err,result){
            
            // delete call log from queue
            self.deleteCallByUserId(result.userFrom._id);

            if(_.isEmpty(result.socketIds)){
                console.log('call_received sent to no one');
            }else{
                
                _.forEach(result.socketIds,function(socketInfo){
                    
                    SocketAPIHandler.emitToSocket(socketInfo.socketId,"call_received",{
                    });
                
                });
                
            }
            
        });
        
    });

    
    /**
     * @api {socket} "call_answer" answer to call request
     * @apiName answer to call request
     * @apiGroup Socket 
     * @apiDescription answer to call request
     * @apiParam {string} userId user id
     */
    
    socket.on('call_answer', function(param){

        if(_.isNull(param.userId)){
            console.log('call_answer socketerror', {code:Const.responsecodeCallingInvalidParamInvalidUserId});
            socket.emit('socketerror', {code:Const.responsecodeCallingInvalidParamInvalidUserId});
            return;
        }

        console.log('call_answer',param);

        var userId = param.userId;

        async.waterfall([
            
            // get user socket ids
            function(done){
                
                var result = {};
                
		        // add socket id to the user
		        DatabaseManager.redisGet(Const.redisKeyUserId + userId,function(err,value){
		            
                    result.socketIds = value;
                    
                    done(null,result)
                    
		        });

            },
            function(result,done){
                
                // get from user model
		        DatabaseManager.redisGet(Const.redisKeySocketId + socket.id,function(err,value){
		            
                    result.userFrom = value;
                    
                    done(null,result)
                    
		        });
                
                
            },
            function(result,done){
                
                // get from user sockets
		        DatabaseManager.redisGet(Const.redisKeyUserId + result.userFrom._id,function(err,value){
		            
                    result.userFromSockets = value;
                    
                    done(null,result)
                    
		        });
                
                
            }
        ],
        function(err,result){
            
            if(_.isEmpty(result.socketIds)){
                
                console.log('call_answer sent to no one');
                
            }else{
                
                //Utils.stripPrivateData(result.userFrom);
                
                _.forEach(result.socketIds,function(socketInfo){
                    
                    SocketAPIHandler.emitToSocket(socketInfo.socketId,"call_answer",{
                        failedType: param.rejectType
                    });
                
                });

                _.forEach(result.userFromSockets,function(socketInfo){
                    
                    if(socketInfo.socketId != socket.id)
	                    SocketAPIHandler.emitToSocket(socketInfo.socketId,"call_reject_mine",{
							
	                    });
                
                });
                
            }
            
        });
        
    });

   /**
     * @api {socket} "call_close" finish call
     * @apiName finish call
     * @apiGroup Socket 
     * @apiDescription finish call
     * @apiParam {string} userId user id
     */
    
    socket.on('call_close', function(param){

        if(_.isNull(param.userId)){
            console.log('call_close socketerror', {code:Const.responsecodeCallingInvalidParamInvalidUserId});
            socket.emit('socketerror', {code:Const.responsecodeCallingInvalidParamInvalidUserId});
            return;
        }

        console.log('call_close',param);

        var userId = param.userId;
        
        async.waterfall([
            
            // get user socket ids
            function(done){
                
                var result = {};
                
		        // add socket id to the user
		        DatabaseManager.redisGet(Const.redisKeyUserId + userId,function(err,value){
		            
                    result.socketIds = value;
                    
                    done(null,result)
                    
		        });

            },
            function(result,done){
                
                /*
                // get from user model
		        DatabaseManager.redisGet(Const.redisKeySocketId + socket.id,function(err,value){
		            
                    result.userFrom = value;
                    
                    done(null,result)
                    
		        });
                */
                
                done(null,result)
                
            }
        ],
        function(err,result){
            
            if(_.isEmpty(result.socketIds)){
                
                console.log('call_close sent to no one');

            }else{
                
                _.forEach(result.socketIds,function(socketInfo){
                    
                    SocketAPIHandler.emitToSocket(socketInfo.socketId,"call_close",{
                    });
                
                });
                
            }
            
        });
        
    });
    
}

CallingActionsHandler.prototype.deleteCallByCallId = function(callId){

    var self = this;

    // delete timer

    // find a redis key
    DatabaseManager.redisClient.keys(Const.redisCallQueue + "_*_" + callId,function(err,keys){

        if(!err){

            // this must always 1 key, but for just in case I use iteration
            _.forEach(keys,function(key){
                DatabaseManager.redisDel(key)
            });

        }
        
    });

}

CallingActionsHandler.prototype.deleteCallByUserId = function(userId){

    var self = this;

    // find a redis key
    DatabaseManager.redisClient.keys(Const.redisCallQueue + "_" + userId + "_*" ,function(err,keys){

        if(!err){

            _.forEach(keys,function(key){
                DatabaseManager.redisDel(key);
            });
        
        }

    });

}

module["exports"] = new CallingActionsHandler();