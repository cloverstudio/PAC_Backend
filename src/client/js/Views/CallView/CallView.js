var Backbone = require('backbone');
var _ = require('lodash');
var webrtc = require('webrtcsupport');
var getUserMedia = require('getusermedia');
var async = require('async');

var Utils = require('../../lib/utils');
var Const = require('../../lib/consts');
var Config = require('../../lib/init');

var alertDialog = require('../Modals/AlertDialog/AlertDialog');

var SimpleWebRTC = require('../../lib/SimpleWebRTC/simplewebrtc');

var socketIOManager = require('../../lib/SocketIOManager');
var loginUserManager = require('../../lib/loginUserManager');

var template = require('./CallView.hbs');

var CallView = Backbone.View.extend({
    
    container : "",
    callOptions: null,
    webRTC: null,
    roomId: "",
    timePassed: 0,
    callEstablished: false,
    timer: null,
    videoStatus: false,
    audioStatus: false,
    initialize: function(options) {
        this.callOptions = options.callOptions;
        this.container = options.container;
        this.render();
    },

    render: function() {

        $(this.container).append(template({
            callOptions:this.callOptions,
            me:loginUserManager.getUser()
        }));

        this.roomId = Utils.chatIdByUser(
            loginUserManager.getUser(),
            this.callOptions.target
        )

        if(this.callOptions.mediaType == Const.callMediaTypeVideo){

            $('#voice-holder').hide();
            
        }

        if(this.callOptions.mediaType == Const.callMediaTypeAudio){

            $('#video-holder').hide();
            $('.media-btn-holder.video').hide();
            
        }
        
        this.onLoad();
        
        return this;

    },

    onLoad: function(){
        
        var self = this;

        var media = {
            video: false,
            audio: true
        };
        
        if(this.callOptions.mediaType == Const.callMediaTypeVideo){
            media.video = true;
        }
        
        this.videoStatus = media.video;
        this.audioStatus = media.audio;

        
        if(this.callOptions.mediaType == Const.callMediaTypeVideo && 
            this.callOptions.type == Const.callTypeIncomming){
                
            this.videoStatus = false;
            
        }
            
        this.updateMediaButton();
        
        this.webRTC = new SimpleWebRTC({
            debug: true,
            localVideoEl: 'video-mine',
            remoteVideosEl: 'video-target',
            url: "/signaling", // socket.io name space
            autoRequestMedia: true,
            media: media,
            peerConnectionConfig  : {
                iceTransports : "relay"
            },
        });

        this.webRTC.on('connectionReady', function (sessionId) {

        });

        this.webRTC.on('readyToCall', function () {
            self.webRTC.joinRoom(self.roomId);
        });
                    
        this.webRTC.on('createdPeer', function (peer) {
            
            self.callEstablished = true;
            
            if(self.callOptions.mediaType == Const.callMediaTypeVideo && 
                self.callOptions.type == Const.callTypeIncomming){
                    
                //self.webRTC.pauseVideo();
                
            }
            
        });
                    
        this.webRTC.on('remove', function () {
            
            self.finishCall();
            
        });

        this.webRTC.on('error', function (err) {
            alertDialog.show(Utils.l10n("WebRTC error"),Utils.l10n("Connection cannot be established."));
            self.finishCall();
        });

        this.webRTC.on('localMediaError', function (err) {
            alertDialog.show(Utils.l10n("Local media error"),Utils.l10n("Please check you have microphone and video support."));
            self.finishCall();
        });
        
        this.timer = window.setInterval(function(){
            self.updateTimer();
        }, 1000);
        
        this.attachEvents();
        
    },
    attachEvents: function(){
        
        var self = this;
        
        $('#btn-finishcall').unbind().on('click',function(){
            
            self.finishCall();
             
        });

        $('#btn-mute-video').unbind().on('click',function(){
            
            self.tuggleVideo();
             
        });
        
        $('#btn-mute-audio').unbind().on('click',function(){
            
            self.tuggleAudio();
             
        });

        $('#call-windowstate').unbind().on('click',function(){

            if($('#callingview').hasClass('window-mini')){
                $('#call-windowstate').attr('src','/images/UI/minimize.png')
                $('#callingview').removeClass('window-mini');
                $('#callingview').addClass('window-full');
            }else{
                $('#call-windowstate').attr('src','/images/UI/maximize.png')
                $('#callingview').removeClass('window-full');
                $('#callingview').addClass('window-mini');
            }


        });
        
    },
    finishCall: function(){
        
        var self = this;
        
        socketIOManager.emit('call_close',{
            userId : self.callOptions.target._id,
        });

        Backbone.trigger(Const.NotificationCallClose);
        
    },
    close:function(cb){
        
        var self = this;
        
        if(!this.webRTC)
            return;
            
        if(this.timer)
            window.clearInterval(this.timer);

        this.webRTC.stopLocalVideo();
        this.webRTC.leaveRoom();

        this.webRTC.on('remove_mine', function () {
            
            self.webRTC.disconnect();
            
            self.callEstablished = false;
            
            self.webRTC.off("connectionReady");
            self.webRTC.off("readyToCall");
            self.webRTC.off("createdPeer");
            self.webRTC.off("remove");
            self.webRTC.off("error");
            self.webRTC.off("localMediaError");
            
            self.webRTC = null;
            
            if(cb)
                cb();
                
        });

    },
    updateTimer: function(){
          
        this.timePassed++;
        
        var sec = this.timePassed % 60;
        var min = Math.floor(this.timePassed / 60);
        
        var secStr = sec + "";
        var minStr = min + "";
        
        if(secStr.length == 1){
            secStr = "0" + secStr;
        }

        if(minStr.length == 1){
            minStr = "0" + minStr;
        }
        
        $('#call-status').html(minStr + ":" + secStr);
        
    },
    
    tuggleVideo: function(){
        
        this.videoStatus = !this.videoStatus;
        
        if(this.videoStatus)
            this.webRTC.resumeVideo();
            
        if(!this.videoStatus)
            this.webRTC.pauseVideo();
            
        this.updateMediaButton();
        
    },
    
    tuggleAudio: function(){

        this.audioStatus = !this.audioStatus;
        
        
        if(this.audioStatus)
            this.webRTC.unmute();
            
        if(!this.audioStatus)
            this.webRTC.mute();
              
        this.updateMediaButton();
        
    },
    
    updateMediaButton: function(){
        
        if(this.videoStatus){
            
            $('#btn-mute-video').attr('status','on');
            $('#btn-mute-video').attr('src','/images/UI/video_on.png');
            
            $('#label-mute-video').html('video');
            
        }

        if(!this.videoStatus){
            
            $('#btn-mute-video').attr('status','off');
            $('#btn-mute-video').attr('src','/images/UI/video_off.png');
            
            $('#label-mute-video').html('paused');
            
        }

        if(this.audioStatus){
            
            $('#btn-mute-audio').attr('status','on');
            $('#btn-mute-audio').attr('src','/images/UI/voice_on.png');
            
            $('#label-mute-audio').html('mute');
            
        }

        if(!this.audioStatus){
            
            $('#btn-mute-audio').attr('status','off');
            $('#btn-mute-audio').attr('src','/images/UI/voice_off.png');
            
            $('#label-mute-audio').html('unmute');
            
            
        }
        
    }
    
});

module.exports = CallView;
