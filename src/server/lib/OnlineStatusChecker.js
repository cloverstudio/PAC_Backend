/** Handles use to handle online status for each user */

var mongoose = require('mongoose');
var redis = require("redis");
var _ = require('lodash');
var async = require('async');

var Const = require('./consts.js');
var Conf = require('./init.js');
var Utils = require('./utils.js');

var DatabaseManager = require('./DatabaseManager');
var SocketConnectionHandler = require("./SocketConnectionHandler");

var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');

var OnlineStatusChecker = {
    
    sentSocketIds: [],
    answeredSocketdIds: [],
    isStarted : false,
    addSocketId: function(socketId){
        
        if(this.socketIds.indexOf(socketId) == -1){
            this.socketIds.push(socketId);
            this.answeredSocketdIds.push(socketId);
        }

    },
    addAnswer: function(socketId){
        
        this.answeredSocketdIds.push(socketId);  
        
    },
    start:function(){
        
        return;
        
        if( !Conf.isMasterServer )
            return;

        var self = this;
        
        if(this.isStarted)
            return
            
        this.isStarted = true;
        
        this.check();

    },
    sendPing: function(){
	    
	    var self = this;
	    
        async.waterfall([
        
	        function(done){
		        
		        var result = {};
		        
                result.socketIds = SocketConnectionHandler.getAllSockets();

                done(null,result);
		        
	        },
	        function(result,done){
		        
		        done(null,result);
		        
	        }
	        
        ],function(err,result){
	        
			self.sentSocketIds = [];
			
	        _.forEach(result.socketIds,function(socketId){
	            
	            self.sentSocketIds.push(socketId);
	            SocketAPIHandler.emitToSocket(socketId,"spikaping",{});
	             
	        });

	        _.debounce(function(){
	            
	            self.check();
	            
	        },Const.heartBeatInterval * 1000)();
	        
        });
        
    },
    check: function(){
		
        var self = this;

        var noReply = _.filter(this.sentSocketIds,function(socketId){
	    	
	    	return self.answeredSocketdIds.indexOf(socketId) == -1;
	    	 
        });
        
        async.eachSeries(noReply,function(deleteSocketId,done){

            async.waterfall([
            
                function(doneAsync){
                    
                    var result = {};
                    
                    // get user id
                    DatabaseManager.redisGet(Const.redisKeySocketId + deleteSocketId,function(err,value){
                        result.user = value;
                        doneAsync(err,result);
                    });

                },
                function(result,doneAsync){
                    
                    SocketConnectionHandler.deleteSocketId(deleteSocketId,result.user,function(err,value){
                        doneAsync(null,result);
                    });
                    
                },
                function(result,doneAsync){
                    
                    doneAsync(null,result);
                    
                },
            ],function(err,result){

                done(err);

            });

        },function(err){

	        self.answeredSocketdIds = [];
	        self.sendPing();
            
        });

    }
    
}

module["exports"] = OnlineStatusChecker;