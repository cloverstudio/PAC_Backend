var $ = require('jquery');
var _ = require('lodash');
var Utils = require('../../../lib/utils.js');
var UIUtils = require('../../../lib/UIUtils');
var Const = require('../../../lib/consts.js');
var validator = require('validator');
var async = require('async');

var loginUserManager = require('../../../lib/loginUserManager');
var AddInboundHookClient = require('../../../lib/APIClients/AddInboundHookClient');
var MyRoomListClient = require('../../../lib/APIClients/MyRoomListClient');
var AddOutgoingHookClient = require('../../../lib/APIClients/AddOutgoingHookClient');

var template = require('./NewHook.hbs');
var templateStep1 = require('./NewHookStep1.hbs');
var templateStep2_in = require('./NewHookStep2_in.hbs');
var templateStep2_out = require('./NewHookStep2_out.hbs');

var NewHookDialog = {
    
    hookType: '',
    callBack: null,
    $: function(selector){
        if(!selector)
            selector = '';
            
        return $("#modal-hook " + selector)
    },
    show: function(callBack) {

        var self = this;
        
        this.callBack = callBack;
        
        $('body').append(template({
        }));
        
        this.$().on('hidden.bs.modal', function(e) {
            self.$().remove();
        })
        
        this.$('#modal-btn-close').on('click', function() {
            self.hide();
        });
        
        this.$().modal('show');
        
        this.step1();
    },
    
    hide: function(onFinish) {
        
        var self = this;
        
        this.$().on('hidden.bs.modal', function(e) {
            
            self.$().remove();
            
            if (!_.isUndefined(onFinish)) {
                onFinish();
            }
        })
        
        this.$().modal('hide');
    },
    step1: function(){
        
        var self = this;
        
        this.$("#wizard-container").html(templateStep1({}));
        
        $('#btn-newhook-inbound').on('click',function(){
            
            self.hookType = Const.hookTypeInbound;
            
            self.step2In();
             
        });

        $('#btn-newhook-outgoing').on('click',function(){
            
            self.hookType = Const.hookTypeOutgoing;
            self.step2Out();
             
        });

    },
    step2In: function(){
        
        var self = this;

        async.waterfall([function(done){
            
            var result = {};
            
            MyRoomListClient.send(function(myroomlistResult){

                result.rooms = myroomlistResult.rooms;
                done(null,result);
                
            },function(errCode){
                UIUtils.handleAPIErrors(errCode);
                
                done(errCode,result);
            });
            
        },
        function(result,done){

            self.$("#wizard-container").html(templateStep2_in({
                rooms:result.rooms
            }));
                
            self.$('#modal-btn-send').removeAttr('disabled');

            self.$('#modal-btn-send').on('click',function(){
                
                var targetId = self.$('#target-id').val();
                var targetType = Const.chatTypeRoom;
                
                if(targetId == 'me'){
                    targetType = Const.chatTypePrivate;
                    targetId = loginUserManager.getUser()._id;
                }
                
                result.targetType = targetType;
                result.targetId = targetId;
                
                done(null,result);
  
            });
            
        }],
        function(err,result){
            
            if(err){
                self.hide();
                return;
            }

            AddInboundHookClient.send(result.targetType,result.targetId,function(res){
                
                self.$('.alert-success').css('display','block');
                
                _.debounce(function(){
                    
                    self.hide();
                    if(self.callBack) self.callBack();
                    
                },500)();

            },function(errCode){
                
                    UIUtils.handleAPIErrors(errCode);
                
            });
                
            
        });
        
    },
    step2Out: function(){
        
        var self = this;
        
        async.waterfall([function(done){
            
            var result = {};
            
            MyRoomListClient.send(function(myroomlistResult){

                result.rooms = myroomlistResult.rooms;
                done(null,result);
                
            },function(errCode){
                UIUtils.handleAPIErrors(errCode);
                
                done(errCode,result);
            });
            
        },
        function(result,done){
            
            self.$("#wizard-container").html(templateStep2_out({
                rooms:result.rooms
            }));
                
            self.$('#tb-url').on('keyup',function(){
                
                if($(this).val().length > 0){
                    self.$('#modal-btn-send').removeAttr('disabled');
                }else{
                    self.$('#modal-btn-send').attr('disabled','disabled');
                }
                
            });

            self.$('#modal-btn-send').on('click',function(){
                
                self.$('.alert-danger').css('display','none');
                
                var url = self.$('#tb-url').val();
                
                if(validator.isURL(url)){
                    
                    result.url = url;
                    
                    var targetId = self.$('#target-id').val();
                    var targetType = Const.chatTypeRoom;
                    
                    if(targetId == 'me'){
                        targetType = Const.chatTypePrivate;
                        targetId = loginUserManager.getUser()._id;
                    }
                    
                    result.targetType = targetType;
                    result.targetId = targetId;
                    
                    done(null,result);
                    
                }else{
                    self.$('.alert-danger').css('display','block');
                    self.$('.alert-danger').text(Utils.l10n('Please input valid URL'));
                }
                
            });
            
        }],
        function(err,result){
            
            if(err){
                self.hide();
                return;
            }
            
            AddOutgoingHookClient.send(
                    result.url,
                    result.targetType,
                    result.targetId,function(res){
                
                self.$('.alert-success').css('display','block');
                
                _.debounce(function(){
                    
                    self.hide();
                    if(self.callBack) self.callBack();
                    
                },500)();

            },function(errCode){
                
                    UIUtils.handleAPIErrors(errCode);
                
            });
        
            
        });
        
    }
    
}

module.exports = NewHookDialog;