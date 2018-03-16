var socket = require('socket.io-client');
var Backbone = require('backbone');
var _ = require('lodash');

var Const = require('./consts');
var Config = require('./init');
var Utils = require('./utils');

var loginUserManager = require('./loginUserManager');
var NotificationManager = require('./NotificationManager');

var SocketIOManager = require('./SocketIOManager');

var KeepAliveManager = {

    init: function () {

        setInterval(function () {

            if (!loginUserManager.getUser())
                return;

            SocketIOManager.emit("keepalive", {
                userId: loginUserManager.getUser()._id
            });

        }, Const.keepAliveInterval);

    }

};

// Exports ----------------------------------------------
module["exports"] = KeepAliveManager;

