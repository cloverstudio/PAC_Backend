
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

var webpush = require('web-push');

PushNotificationSender = {

    start: function (tokenAndBadgeCount, payload, isVoip) {

        var self = this;

        var tokensFiltered = [];
        var userModel = UserModel.get();

        async.eachSeries(tokenAndBadgeCount, (tokenAndBadge, doneEach) => {

            var pushToken = tokenAndBadge.token;
            var unreadCount = tokenAndBadge.badge;

            // get user 
            userModel.find({
                UUID: {
                    $elemMatch: { pushTokens: pushToken }
                }
            }, function (err, findResult) {

                if (!findResult) {
                    doneEach(null);
                    return;
                }

                var isBlocked = false;

                findResult.forEach(function (user) {

                    // check is blocked
                    var UUIDs = user.UUID;

                    var theRow = _.find(UUIDs, (o) => {

                        if (o.pushTokens)
                            return o.pushTokens.indexOf(pushToken) != -1;
                        else
                            return false;

                    });

                    if (theRow && theRow.blocked == true) {
                        isBlocked = true;
                    } else {

                    }

                });

                if (!isBlocked) {
                    tokensFiltered.push(tokenAndBadge);
                }

                doneEach(null);
            });

        }, (err) => {

            self.send(tokensFiltered, payload, isVoip);

        });

    },

    send: function (tokenAndBadgeCount, payload, isVoip) {

        var self = this;

        async.eachLimit(tokenAndBadgeCount, Const.pushTokenThreadSize, function (tokenAndBadge, donePushEach) {

            var pushToken = tokenAndBadge.token;
            var unreadCount = tokenAndBadge.badge;

            async.parallel([

                function (donePushOne) {

                    if (isVoip) {
                        donePushOne(null);
                        return;
                    }

                    // send dev push
                    if (pushToken.length != 64) {
                        donePushOne(null);
                        return;
                    }


                    // send apns adhoc
                    var options = {
                        production: false
                    };

                    if (Config.apnsCertificates.dev.token) {

                        options.token = Config.apnsCertificates.dev.token;

                    } else if (Config.apnsCertificates.dev.cert
                        && Config.apnsCertificates.dev.key) {

                        options.cert = Config.apnsCertificates.dev.cert;
                        options.key = Config.apnsCertificates.dev.key;

                    } else {
                        return donePushOne(null);
                    }

                    var apnProvider = new apn.Provider(options);
                    var note = new apn.Notification();

                    note.expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day
                    note.badge = unreadCount;
                    note.sound = "ping.aiff";
                    note.alert = payload.message.messageiOS;
                    note.category = Const.apnCategoryMessage;
                    note.payload = payload;
                    note.topic = Config.apnsCertificates.dev.appbundleid;
                    note.contentAvailable = true;

                    apnProvider.send(note, pushToken).then((result) => {
                        apnProvider.shutdown();
                    });

                    donePushOne(null);

                },

                function (donePushOne) {

                    if (isVoip) {
                        donePushOne(null);
                        return;
                    }

                    if (pushToken.length != 64) {
                        donePushOne(null);
                        return;
                    }

                    // send apns adhoc
                    var options = {
                        production: true
                    };

                    if (Config.apnsCertificates.adhoc.token) {

                        options.token = Config.apnsCertificates.adhoc.token;

                    } else if (Config.apnsCertificates.adhoc.cert
                        && Config.apnsCertificates.adhoc.key) {

                        options.cert = Config.apnsCertificates.adhoc.cert;
                        options.key = Config.apnsCertificates.adhoc.key;

                    } else {
                        return donePushOne(null);
                    }

                    var apnProvider = new apn.Provider(options);
                    var note = new apn.Notification();

                    note.expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day
                    note.badge = unreadCount;
                    note.sound = "ping.aiff";
                    note.alert = payload.message.messageiOS;
                    note.category = Const.apnCategoryMessage;
                    note.payload = payload;
                    note.topic = Config.apnsCertificates.adhoc.appbundleid;
                    note.contentAvailable = true;

                    apnProvider.send(note, pushToken).then((result) => {
                        apnProvider.shutdown();
                    });

                    donePushOne(null);

                },

                function (donePushOne) {

                    if (isVoip) {
                        donePushOne(null);
                        return;
                    }

                    if (pushToken.length != 64) {
                        donePushOne(null);
                        return;
                    }

                    // send apns store
                    var options = {
                        production: true
                    };

                    if (Config.apnsCertificates.store.token) {

                        options.token = Config.apnsCertificates.store.token;

                    } else if (Config.apnsCertificates.store.cert
                        && Config.apnsCertificates.store.key) {

                        options.cert = Config.apnsCertificates.store.cert;
                        options.key = Config.apnsCertificates.store.key;

                    } else {
                        return donePushOne(null);
                    }

                    var apnProvider = new apn.Provider(options);
                    var note = new apn.Notification();

                    note.expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day
                    note.badge = unreadCount;
                    note.sound = "ping.aiff";
                    note.alert = payload.message.messageiOS;
                    note.category = Const.apnCategoryMessage;
                    note.payload = payload;
                    note.topic = Config.apnsCertificates.store.appbundleid;
                    note.contentAvailable = true;

                    apnProvider.send(note, pushToken).then((result) => {

                        if (!_.isEmpty(result.failed))
                            self.deletePushTokens(pushToken);

                        apnProvider.shutdown();

                    });

                    donePushOne(null);

                },

                function (donePushOne) {

                    if (!isVoip) {
                        donePushOne(null);
                        return;
                    }

                    if (pushToken.length != 64) {
                        donePushOne(null);
                        return;
                    }

                    if (!Config.apnsCertificates.voip) {
                        donePushOne(null);
                        return;
                    }

                    if (!Config.apnsCertificates.voip.cert ||
                        !Config.apnsCertificates.voip.key) {

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

                    var apnProvider = new apn.Provider(options);
                    var note = new apn.Notification();

                    note.expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day
                    note.badge = unreadCount;
                    note.sound = "ping.aiff";
                    note.alert = payload.message.messageiOS;
                    note.category = Const.apnCategoryMessage;
                    note.payload = payload;
                    note.contentAvailable = true;

                    apnProvider.send(note, pushToken).then((result) => {
                        apnProvider.shutdown();
                    });

                    donePushOne(null);

                },

                function (donePushOne) {

                    if (pushToken.length <= 64) {
                        donePushOne(null);
                        return;
                    }

                    var gcmData = {
                        roomId: payload.roomId,
                        message: payload.message,
                        fromuser: payload.from,
                        pushType: payload.pushType,
                        unreadCount: unreadCount
                    };

                    if (payload.file) {
                        gcmData.file = payload.file;
                    }

                    if (payload.location) {
                        gcmData.location = payload.location;
                    }

                    if (payload.group) {
                        gcmData.group = payload.group;
                    }

                    if (payload.room) {
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

                    if (!_.isEmpty(Config.fcmServerKey)) {

                        var fcm = new FCM(Config.fcmServerKey);

                        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                            to: pushToken,
                            collapse_key: 'spikaforbusiness',

                            data: gcmData
                        };

                        fcm.send(message, function (err, response) {

                            if (err) {

                                console.log(pushToken + " Something has gone wrong!", err);

                                if (err == "InvalidServerResponse")
                                    return;

                                err = JSON.parse(err);

                                if (err.failure)
                                    self.deletePushTokens(pushToken);

                            }
                            else {
                                //console.log(pushToken + " Successfully sent with response: ", response);
                            }

                        });

                    }

                    donePushOne(null);
                },

                function (donePushOne) {

                    if (!Config.vapidDetails ||
                        !Config.vapidDetails.mailTo ||
                        !Config.vapidDetails.publicKey ||
                        !Config.vapidDetails.privateKey)

                        return donePushOne(null);

                    webpush.setVapidDetails('mailto:' + Config.vapidDetails.mailTo, Config.vapidDetails.publicKey, Config.vapidDetails.privateKey);

                    webpush.sendNotification(pushToken, JSON.stringify(payload))
                        .catch(err => {

                            if (err.statusCode === 410) {
                                console.log('deleting push subscription');
                                self.deletePushTokens(pushToken);
                            }
                        });

                    donePushOne(null);
                }

            ], function (err) {

                donePushEach(null);

            });

        }, function (err) {



        });

    },

    deletePushTokens: function (pushToken) {

        var userModel = UserModel.get();

        userModel.find(
            {
                $or: [
                    { pushToken: pushToken },
                    { UUID: { $elemMatch: { pushTokens: pushToken } } },
                    { webPushSubscription: { $elemMatch: { endpoint: pushToken.endpoint } } }
                ]
            },
            (err, findResult) => {

                if (err)
                    console.log(err);

                findResult.forEach((user) => {

                    var UUID = _.map(user.UUID, (uuid) => {
                        uuid.pushTokens = _.pull(uuid.pushTokens, pushToken)
                        return uuid;
                    });

                    var pushTokens = _.pull(user.pushToken.toObject(), pushToken);

                    var webPushSubscription = _.remove(user.webPushSubscription.toObject(), function (pushSubs) {
                        return pushSubs.endpoint !== pushToken.endpoint;
                    });

                    userModel.update(
                        { _id: user._id },
                        {
                            pushToken: pushTokens,
                            UUID: UUID,
                            webPushSubscription: webPushSubscription
                        },
                        { multi: true },
                        (err, updateResult) => {

                            if (err)
                                console.log(err);

                        });

                });

            });

    }
}


module["exports"] = PushNotificationSender;