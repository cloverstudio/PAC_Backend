/** Used to handle online status for each user */

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var async = require('async');

var Const = require('./consts.js');
var Conf = require('./init.js');
var Utils = require('./utils.js');

var DatabaseManager = require("./DatabaseManager");
var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');

var SocketConnectionHandler = {
    
    init:function(){
	    
	    return true;
	    
    },
    newSocketConnection:function(user,processId,socketId,callBack){
		
		var self = this;
		
		// delete all scokets from same processId
		var redisClient = DatabaseManager.redisClient;
        
		// make user online
		DatabaseManager.redisSaveValue(Const.redisKeyOnlineStatus + user._id.toString(),Utils.now());
		
		// save user data 
		DatabaseManager.redisSave(Const.redisKeySocketId + socketId,user);
		
		// add socket id to the user
		DatabaseManager.redisGet(Const.redisKeyUserId + user._id.toString(),function(err,value){
		
			if(!value){
				value = [];
			}
			
			value.push({
				socketId: socketId,
				connected : Utils.now()
			})
			
			DatabaseManager.redisSave(Const.redisKeyUserId + user._id.toString(),value);
			
			callBack();
			
		});

    },

	getAllSockets: function(){

		var sockets = SocketAPIHandler.nsp.connected;

		var socketIds = _.map(sockets,function(socket){
			return socket.id;
		});

		return socketIds;

	},
	deleteSocketId: function(socketIdToDelete,userOrUserId,callBack){
		
        if(!userOrUserId){
            
            if(callBack)
                callBack(null,null);
                
            return;
        }
         
         var userId = userOrUserId._id;
         if(!userId)
         	userId = userOrUserId;
         	
        //var onlineSocketId = 
        
        this.socketIds = _.filter(this.socketIds,function(socketId){

	    	return socketIdToDelete != socketId;
	    	 
        });

        DatabaseManager.redisGet(Const.redisKeyUserId + userId,function(err,onlineSocketIds){

            onlineSocketIds = _.filter(onlineSocketIds,function(onlineSocketId){
                
                return onlineSocketId.socketId != socketIdToDelete;
                    
            });
            
            DatabaseManager.redisSave(Const.redisKeyUserId + userId,onlineSocketIds);
            DatabaseManager.redisDel(Const.redisKeySocketId + socketIdToDelete);
            
            if(onlineSocketIds.length == 0){
                
                // make offline
                DatabaseManager.redisDel(Const.redisKeyOnlineStatus + userId);
                DatabaseManager.redisDel(Const.redisKeyUserId + userId,onlineSocketIds);
                
            }
            
            if(callBack)
                callBack(err,null);
            
        });
            
        
        
    }
    
    
}

module["exports"] = SocketConnectionHandler;