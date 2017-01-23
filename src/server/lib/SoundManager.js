var socket = require('socket.io-client');
var Backbone = require('backbone');
var _ = require('lodash');
var howl = require('howler');

var Const = require('./consts');
var Config = require('./init');
var Utils = require('./utils');

var SoundManager = {
    
    soundNotification: null,
    soundRing: null,
    init:function(){

        this.soundNotification = new Howl({
            urls: ['/sounds/notification.mp3']
        });

        this.soundRing = new Howl({
            urls: ['/sounds/ringtone.mp3'],
            loop: true
        });
        
    },
    startRingtone: function(){
        this.soundRing.play();
    },
    stopRingtone: function(){
        
    },
    notification: function(){
        this.soundNotification.play();
    }
    
};

// Exports ----------------------------------------------
module["exports"] = SoundManager;

