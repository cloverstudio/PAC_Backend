var Backbone = require('backbone');
var _ = require('lodash');
var webrtc = require('webrtcsupport');
var getUserMedia = require('getusermedia');
var async = require('async');

var Utils = require('../../lib/utils');
var Const = require('../../lib/consts');
var Config = require('../../lib/init');

var alertDialog = require('../Modals/AlertDialog/AlertDialog');

var socketIOManager = require('../../lib/SocketIOManager');
var soundManager = require('../../lib/SoundManager');

var template = require('./CallRequestView.hbs');

var CallRequestView = Backbone.View.extend({
    
    container : "",
    isCalling : false,
    callOptions: null,
    callView: null,
    initialize: function(options) {
        this.container = options.container;
        this.render();
    },

    render: function() {
        
        /*
        $(this.container).html(template({
            Config:Config
        }));
        */
        
        this.onLoad();
        
        return this;

    },

    onLoad: function(){
        
        var self = this;
        
        Backbone.on(Const.NotificationStartCalling, function(options){

	       if(self.isCalling)
	            return;
            
            if(!webrtc.support){
                
                alertDialog.show(Utils.l10n("Browser error"),Utils.l10n("Your browser doesnt support calling featuer."));
                
                return;
            }
        
            if(self.isCalling)
                return;
            
            if(!options.target)
                return;

            if(!options.type)
                return;

            if(!options.mediaType)
                return;

            self.makeOutgoingCall(options);
            
        });

        Backbone.on(Const.NotificationCallCancel, function(params){

	       if(!self.isCalling)
	            return;
                
            alertDialog.show(Utils.l10n("Call Canceled"),Utils.l10n("User canceled call."));
            
            _.debounce(function(){
                self.closeCall();
            },1000)();
            
            
        });

        Backbone.on(Const.NotificationCallRejectMine, function(params){

	       if(!self.isCalling)
	            return;
	            
            _.debounce(function(){
                self.closeCall();
            },1000)();
            
        });
        
        Backbone.on(Const.NotificationCallFaild, function(params){

			if(!self.isCalling)
				return;
				
            if(params.failedType == Const.callFailedUserOffline){
                alertDialog.show(Utils.l10n("Call Failed"),Utils.l10n("The user is offline."));
            }

            
            if(params.failedType == Const.callFailedUserBusy){
                alertDialog.show(Utils.l10n("Call Failed"),Utils.l10n("The user is busy."));
            }

            
            if(params.failedType == Const.callFailedUserReject){
                alertDialog.show(Utils.l10n("Call Failed"),Utils.l10n("User declined."));
            }

            if(params.failedType == Const.callFailedUserNotSupport){
                alertDialog.show(Utils.l10n("Call Failed"),Utils.l10n("User doesnt support calling feature."));
            }
            
            _.debounce(function(){
                self.closeCall();
            },1000)();
            
        });
		
		
        Backbone.on(Const.NotificationCallReceived, function(params){

			if(!self.isCalling)
				return;
	            
            $('#call-status').text(Utils.l10n("Calling..."));

        });

        Backbone.on(Const.NotificationCallAnswer, function(params){

			if(!self.isCalling)
				return;
	            
            self.startOutgoingCall();

        });
        
        Backbone.on(Const.NotificationCallRequest, function(params){
            
            console.log('call request',params);

            if(self.isCalling){
            
                socketIOManager.emit('call_reject',{
                    
                    userId : params.user._id,
                    rejectType : Const.callFailedUserBusy
                    
                });
            
                return;
                
            }

            var callOptions = {
                type: Const.callTypeIncomming,
                mediaType:params.mediaType,
                target:params.user
            };
            
            self.showIncomingCall(callOptions);

        });

        Backbone.on(Const.NotificationCallClose, function(params){

			if(!self.isCalling)
				return;
	            
            self.closeCall();

        });
        
        
    },
    
    showIncomingCall: function(callOptions){

        var self = this;

        if(!webrtc.support){

            socketIOManager.emit('call_reject',{
                
                userId : callOptions.target._id,
                rejectType : Const.callFailedUserNotSupport
                
            });
                
            return;
        }
        
        soundManager.startRingtone();
        
        self.isCalling = true;
        
        this.callOptions = callOptions;
        
        $(this.container).append(template({
            callOptions:callOptions
        }));
        
        $('#call-status').text(Utils.l10n("Incoming call..."));
        
        $('#callingview').css('opacity',0);
        $('#callingview').css('bottom',-300);
        $('#callingview').animate({
            bottom: "10px",
            opacity: 1.0
        },1000)
        
        self.attachEvents();

        socketIOManager.emit('call_received',{
            
            userId : self.callOptions.target._id,
             
        });
        
    },
    makeOutgoingCall: function(callOptions){

        var self = this;

        async.waterfall([function(done){
            
            var result = {};
            
            var isVideoRequired = false;
            var isAudioReuired = true;
            
            if(callOptions.mediaType == Const.callMediaTypeVideo)
                isVideoRequired = true;
                
            getUserMedia({video: isVideoRequired, audio: isAudioReuired}, function (err, stream) {
            
                result.stream = stream;
                done(err,result);
                
            });

        },
        function(result,done){
            done(null,result)
        }
        ],
        function(err,result){
            
            if(err || !result.stream){
                alertDialog.show(Utils.l10n("Media error"),Utils.l10n("Please check you have microphone and video support."));
                return;
            }
            
            var tracks = result.stream.getTracks();
            _.forEach(tracks,function(track){
                track.stop();
            });
            
            self.isCalling = true;
            self.callOptions = callOptions;
            
            $(self.container).append(template({
                callOptions:callOptions
            }));
            
            $('#call-status').text(Utils.l10n("Connecting..."));
            $('#btn-answer').hide();
            
            $('#callingview').css('opacity',0);
            $('#callingview').css('bottom',-300);
            $('#callingview').animate({
                bottom: "10px",
                opacity: 1.0
            },1000)
            
            self.attachEvents();
            
            soundManager.startRingtone();
            
            socketIOManager.emit('call_request',{
                
                userId : self.callOptions.target._id,
                mediaType : self.callOptions.mediaType
                
            });
        
        });

    },
    
    attachEvents: function(){
        
        var self = this;
        
        $('#btn-finishcall').unbind().on('click',function(){

            if(self.callOptions.type == Const.callTypeOutgoing){
                
                socketIOManager.emit('call_cancel',{
                    
                    userId : self.callOptions.target._id,
                    
                });
                
            }
            
            if(self.callOptions.type == Const.callTypeIncomming){
                
                socketIOManager.emit('call_reject',{
                    
                    userId : self.callOptions.target._id,
                    rejectType : Const.callFailedUserReject
                    
                });
                
            }
            
            self.closeCall();
             
        });
        
        $('#btn-answer').unbind().on('click',function(){
	        
	        self.startIncommingCall();
	        
        });
        
    },
    
    closeCall: function(){
        
        soundManager.stopRingtone();
        
        var self = this;
        
        $('#callingview').animate({
            bottom: -1 * $('#callingview').height()
        },500,function(){
            
            $('#callingview').remove();
            self.isCalling = false;
            
        });

        if(this.callView){
            
            this.callView.close(function(){
                self.callView = null;
            });
            
        }
        
    },
    
    startOutgoingCall: function(){
        
        soundManager.stopRingtone();
        
        this.removeSelf();
        
        var View = require('./CallView.js');   
        this.callView = new View({
            callOptions: this.callOptions,
            container : this.container
        });

    },
    
    startIncommingCall: function(){
        
        soundManager.stopRingtone();
        
        var self = this;
        
        async.waterfall([function(done){
            
            var result = {};
  
            getUserMedia({video: false, audio: true}, function (err, stream) {
            
                result.stream = stream;
                done(err,result);
                
            });

        },
        function(result,done){
            done(null,result)
        }
        ],
        function(err,result){
            
            if(err || !result.stream){
                
                alertDialog.show(Utils.l10n("Media error"),Utils.l10n("Please check you have microphone and video support."));
                
                socketIOManager.emit('call_reject',{
                    
                    userId : self.callOptions.target._id,
                    rejectType : Const.callFailedUserNotSupport
                    
                });
                
                self.closeCall();
                
                return;
                
            }

            var tracks = result.stream.getTracks();
            _.forEach(tracks,function(track){
                track.stop();
            });
            
            socketIOManager.emit('call_answer',{
                userId : self.callOptions.target._id
            });
            
            self.removeSelf();
            
            var View = require('./CallView.js');   
            self.callView = new View({
                callOptions: self.callOptions,
                container : self.container
            });
   
       });

    },
    
    removeSelf: function(){
        
        $('#callingview').remove();
        
    },

    destroy: function(){
        
        console.log('call reqyest destroy');
        
        Backbone.off(Const.NotificationCallClose);
        Backbone.off(Const.NotificationCallRequest);
        Backbone.off(Const.NotificationCallReceived);
        Backbone.off(Const.NotificationCallAnswer);
        Backbone.off(Const.NotificationCallFaild);
        Backbone.off(Const.NotificationCallRejectMine);
        Backbone.off(Const.NotificationCallCancel);
        Backbone.off(Const.NotificationStartCalling);
        
    }
});

module.exports = CallRequestView;
