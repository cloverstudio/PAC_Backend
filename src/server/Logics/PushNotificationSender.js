
var _ = require('lodash');
var async = require('async');
var apn = require('apn');
var FCM = require('fcm-node');
var request = require('request');
var fs = require('fs');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var Utils = require("../lib/utils");

var UserModel = require('../Models/User');

var DatabaseManager = require('../lib/DatabaseManager');
var EncryptionManager = require('../lib/EncryptionManager');
var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');

PushNotificationSender = {
    
    start : function(tokenAndBadgeCount,payload,isVoip){

        var self = this;

        var tokensFiltered = [];
        var userModel = UserModel.get();

        console.log('before',tokenAndBadgeCount.length);

        async.eachSeries(tokenAndBadgeCount,(tokenAndBadge,doneEach) => {

            var pushToken = tokenAndBadge.token;
            var unreadCount = tokenAndBadge.badge;

            // get user 
            userModel.findOne({
                 UUID: { 
                     $elemMatch: { pushTokens:  pushToken } 
                 }
            },function(err,findResult){
                
                if(!findResult){
                    doneEach(null);
                    return;
                }
                // check is blocked
                var UUIDs = findResult.UUID;

                var theRow = _.find(UUIDs,(o) => {

                    if(o.pushTokens)
                        return o.pushTokens.indexOf(pushToken) != -1;
                    else
                        return false;
                    
                });

                if(theRow && theRow.blocked == true){

                }else{
                    tokensFiltered.push(tokenAndBadge);
                }

                doneEach(null);
            });

        },(err) => {

            console.log('after',tokensFiltered.length);

            self.send(tokensFiltered,payload,isVoip);

        });
        
    },

    send : function(tokenAndBadgeCount,payload,isVoip){

        async.eachLimit(tokenAndBadgeCount,Const.pushTokenThreadSize,function(tokenAndBadge,donePushEach){
            
            var pushToken = tokenAndBadge.token;
            var unreadCount = tokenAndBadge.badge;
            
            async.parallel([
                
                function(donePushOne){
                    
                    if(isVoip){
                        donePushOne(null);
                        return;
                    }

                    // send dev push
                    if(pushToken.length != 64){
                            donePushOne(null);
                            return; 
                    }
                    
                    if(!Config.apnsCertificates.dev.cert ||
                        !Config.apnsCertificates.dev.key){
                        
                        donePushOne(null); 
                        return;
                    }

                    if (!fs.existsSync(Config.apnsCertificates.dev.cert) ||
                            !fs.existsSync(Config.apnsCertificates.dev.key)) {

                        donePushOne(null); 
                        return;
                        
                    }

                    
                    var options = {
                        cert: Config.apnsCertificates.dev.cert,
                        key: Config.apnsCertificates.dev.key,
                        production: false
                    };
                    
                    var apnConnection = new apn.Connection(options);
                    
                    var device = new apn.Device(pushToken);
                    
                    var note = new apn.Notification();

                    note.expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day
                    note.badge = unreadCount;
                    note.sound = "ping.aiff";
                    note.alert = payload.message.messageiOS;
                    note.category = Const.apnCategoryMessage;
                    note.payload = payload;
                    
                    apnConnection.pushNotification(note, device);
                    
                    donePushOne(null);
                    
                },

                function(donePushOne){

                    if(isVoip){
                        donePushOne(null);
                        return;
                    }

                    if(pushToken.length != 64){
                            donePushOne(null);
                            return; 
                    }

                    if(!Config.apnsCertificates.adhoc.cert ||
                        !Config.apnsCertificates.adhoc.key){
                        
                        donePushOne(null); 
                        return;
                    }
                    
                    if (!fs.existsSync(Config.apnsCertificates.adhoc.cert) ||
                            !fs.existsSync(Config.apnsCertificates.adhoc.key)) {

                        donePushOne(null); 
                        return;
                        
                    }

                    // send apns adhoc
                    var options = {
                        cert: Config.apnsCertificates.adhoc.cert,
                        key: Config.apnsCertificates.adhoc.key,
                        production: true
                    };
                    
                    var apnConnection = new apn.Connection(options);
                    
                    var device = new apn.Device(pushToken);
                    
                    var note = new apn.Notification();

                    note.expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day
                    note.badge = unreadCount;
                    note.sound = "ping.aiff";
                    note.alert = payload.message.messageiOS;
                    note.category = Const.apnCategoryMessage;
                    note.payload = payload;

                    apnConnection.pushNotification(note, device);
                    
                    donePushOne(null);

                },

                function(donePushOne){

                    if(isVoip){
                        donePushOne(null);
                        return;
                    }

                    if(pushToken.length != 64){
                            donePushOne(null);
                            return; 
                    }

                    if(!Config.apnsCertificates.store.cert ||
                        !Config.apnsCertificates.store.key){
                        
                        donePushOne(null); 
                        return;
                    }
                    
                    if (!fs.existsSync(Config.apnsCertificates.store.cert) ||
                            !fs.existsSync(Config.apnsCertificates.store.key)) {

                        donePushOne(null); 
                        return;
                        
                    }


                    // send apns store
                    var options = {
                        cert: Config.apnsCertificates.store.cert,
                        key: Config.apnsCertificates.store.key,
                        production: true
                    };
                    
                    var apnConnection = new apn.Connection(options);
                    
                    var device = new apn.Device(pushToken);
                    
                    var note = new apn.Notification();

                    note.expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day
                    note.badge = unreadCount;
                    note.sound = "ping.aiff";
                    note.alert = payload.message.messageiOS;
                    note.category = Const.apnCategoryMessage;
                    note.payload = payload;

                    apnConnection.pushNotification(note, device);
                    
                    donePushOne(null);

                },

                function(donePushOne){

                    if(!isVoip){
                        donePushOne(null);
                        return;
                    }

                    if(pushToken.length != 64){
                            donePushOne(null);
                            return; 
                    }

                    if(!Config.apnsCertificates.voip){
                            donePushOne(null);
                            return; 
                    }

                    if(!Config.apnsCertificates.voip.cert ||
                        !Config.apnsCertificates.voip.key){
                        
                        donePushOne(null); 
                        return;
                    }
                    
                    // send apns store
                    var options = {
                        cert: Config.apnsCertificates.voip.cert,
                        key: Config.apnsCertificates.voip.key,
                        production: true
                    };

                    if (!fs.existsSync(Config.apnsCertificates.voip.cert) ||
                            !fs.existsSync(Config.apnsCertificates.voip.key)) {

                        donePushOne(null); 
                        return;
                        
                    }

                    var apnConnection = new apn.Connection(options);
                    
                    var device = new apn.Device(pushToken);
                    
                    var note = new apn.Notification();

                    note.expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day
                    note.badge = unreadCount;
                    note.sound = "ping.aiff";
                    note.alert = payload.message.messageiOS;
                    note.category = Const.apnCategoryMessage;
                    note.payload = payload;

                    apnConnection.pushNotification(note, device);
                    
                    apnConnection.on('connected', function(openSockets) {
                        console.log("apn","connected")
                    });

                    apnConnection.on('error', function(error) {
                        console.log("apn error",error);
                    });

                    apnConnection.on('transmitted', function(notification, device) {
                         console.log("apn transmitted",pushToken);
                    });

                    apnConnection.on('transmissionError', function(errCode, notification, device) {
                        console.log("apn transmissionError" + errCode,pushToken);
                    });

                    apnConnection.on('drain', function () {
                    //
                    });

                    apnConnection.on('timeout', function () {
                    //
                    });

                    apnConnection.on('disconnected', function(openSockets) {
                    //
                    });

                    apnConnection.on('socketError', console.error);

                    donePushOne(null);

                    },

                function(donePushOne){

                    if(pushToken.length <= 64){
                            donePushOne(null);
                            return; 
                    }
                    
                    var gcmData =  {
                        roomId: payload.roomId,
                        message: payload.message,
                        fromuser: payload.from,
                        pushType: payload.pushType
                    };
                    
                    if(payload.file){
                        gcmData.file = payload.file;
                    }
                    
                    if(payload.location){
                        gcmData.location = payload.location;
                    }

                    if(payload.group){
                        gcmData.group = payload.group;
                    }

                    if(payload.room){
                        gcmData.room = payload.room;
                    }
                    
                    /*
                    var message = new gcm.Message({
                        collapseKey: 'spikaforbusiness',
                        priority: 'high',
                        delayWhileIdle: false,
                        timeToLive: 3,
                        dryRun: false,
                        data:gcmData
                    });
                    */
                    
                    if(!_.isEmpty(Config.fcmServerKey)){

                        var fcm = new FCM(Config.fcmServerKey);

                        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                            to: pushToken, 
                            collapse_key: 'spikaforbusiness',
                            
                            data: gcmData
                        };

                        fcm.send(message, function(err, response){
                            if (err) {
                                console.log("Something has gone wrong!");
                            } else {
                                console.log("Successfully sent with response: ", response);
                            }
                        });
                        
                    }
                    
                    donePushOne(null);
                }
                
            ],function(err){
                
                donePushEach(null);
                
            });
            
        },function(err){
            

            
        });

    }
}


module["exports"] = PushNotificationSender;