/** Called for initialization  */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var Utils = require('../lib/utils');

var DatabaseManager = require("../lib/DatabaseManager");

var SocketAPIHandler = {
    
    io:null,
    nsp : null,
    init: function(io){
        
        var self = this;
        this.io = io;
        this.nsp = io.of(Config.socketNameSpace);

        // Use redis to scale server
        var redis = require('socket.io-redis');
        io.adapter(redis(Config.redis));
    
        this.nsp.on('connection', function(socket) {

            require('./LoginActionHandler').attach(self.nsp,socket);
            require('./DisconnectActionHandler').attach(self.nsp,socket);
            require('./PongActionHandler').attach(self.nsp,socket);
            require('./CallingActionsHandler').attach(self.nsp,socket);
            
        });

    },
    emitAll : function(command,param){
        this.io.of(Config.socketNameSpace).emit(command, param);
    },
    emitToSocket: function(socketId,command,param){

        this.nsp.to(socketId).emit(command,param);

    },
    emitToUser: function(userId,command,param){

        var self = this;

        DatabaseManager.redisGet(Const.redisKeyUserId + userId,function(err,value){
            
            if(!value)
                return;
                
            value.forEach((socket) => {

                var socketId = socket.socketId;
                var socket = SocketAPIHandler.nsp.sockets[socketId];

                self.nsp.to(socketId).emit(command,param);

            });

        });

        //this.nsp.to(socketId).emit(command,param);

    },
    emitToRoom: function(roomName,command,param){
        
        this.io.of(Config.socketNameSpace).in(roomName).emit(command, param);

    },
    joinTo: function(userId,type,roomId){

        DatabaseManager.redisGet(Const.redisKeyUserId + userId,function(err,value){
            
            if(!value)
                return;

            value.forEach((socket) => {

                var socketId = socket.socketId;
                var socket = SocketAPIHandler.nsp.sockets[socketId];

                socket.join(type + '-' + roomId);

            });

        });
    },
    leaveFrom: function(userId,type,roomId){

        DatabaseManager.redisGet(Const.redisKeyUserId + userId,function(err,value){
            
            if(!value)
                return;
                
            value.forEach((socket) => {

                var socketId = socket.socketId;
                var socket = SocketAPIHandler.nsp.sockets[socketId];

                socket.leave(type + '-' + roomId);

            });

        });
    }
    
};

module["exports"] = SocketAPIHandler;