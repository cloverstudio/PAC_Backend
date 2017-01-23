window.$ = window.jQuery = require('jquery');
var bootstrap = require('bootstrap-sass');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;

// jquery plugin
require('jquery-colorbox');

// setup routing here
var Routing = require('./routing');

var windowHandler = require('./lib/windowManager');
var localstorageManager = require('./lib/localstorageManager');
var localzationManager = require('./lib/localzationManager');
var SocketIOManager = require('./lib/SocketIOManager');
var SoundManager = require('./lib/SoundManager');
var NotificationManager = require('./lib/NotificationManager');
var EncryptManager = require('./lib/EncryptionManager');
var WebRTC = require('./lib/SimpleWebRTC/simplewebrtc');

// setup view helpers
require('./lib/viewHelpers').attach();

$(function () {

    windowHandler.init();
    localstorageManager.init();
    NotificationManager.init();
    SoundManager.init();
    EncryptManager.init();
    
    // Start Backbone history a necessary step for bookmarkable URL's
    localzationManager.fetchDictionary(function(){
        
        Backbone.history.start();
        
    });

})

// disable ajax cache for old browsers
$.ajaxSetup({ cache: false });
