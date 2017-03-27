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
    
    start:function(){
        
        var redis = DatabaseManager.redisClient;

        setInterval(() => {

            redis.keys(Const.redisKeyOnlineStatus + '*', function (err, keys) {

                if (err) 
                    return console.log(err);

                var now = Utils.now();

                async.eachLimit(keys,100,(key,doneEach) => {

                    redis.get(key, function(err, value) {
                        
                        console.log(value);

                        if(now - value > Const.offlineTimeLimit){

                            // goes offline
                            redis.del(key);
                            
                        }

                        doneEach();
                            
                    });

                },(err2) => {

                    console.log('online checker done');
                    
                });

            });

        },Const.onlineCheckerIntertal);

    }

}

module["exports"] = OnlineStatusChecker;