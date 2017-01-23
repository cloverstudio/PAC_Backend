var Backbone = require('backbone');
var _ = require('lodash');

var Utils = require('../../lib/utils');
var Const = require('../../lib/consts');
var Config = require('../../lib/init');

var SigninClient = require('../../lib/APIClients/SigninClient');
var GuestSigninClient = require('../../lib/APIClients/GuestSigninClient');
var loginUserManager = require('../../lib/loginUserManager');
var localStorage = require('../../lib/localstorageManager');
var SocketIOManager = require('../../lib/SocketIOManager');

var template = require('./SigninView.hbs');

var SigninView = Backbone.View.extend({
    
    container : "",
    disableAutoLogin: false,
    isGuest: false,
    initialize: function(options) {
        this.container = options.container;
        this.disableAutoLogin = options.disableAutoLogin;
        
        if(window.guestMode){
            this.isGuest = true;
        }

        this.render();
    },

    render: function() {
        
        var self = this;
        
        var savedCredentials = {
            
        };

        savedCredentials.remember = localStorage.get(Const.LocalStorageKeyRemember);
        savedCredentials.userid = localStorage.get(Const.LocalStorageKeyUserId);
        savedCredentials.password = localStorage.get(Const.LocalStorageKeyPassword);
        savedCredentials.organization = localStorage.get(Const.LocalStorageKeyOrganization);
        
        if(!this.isGuest && !this.disableAutoLogin && localStorage.get(Const.LocalStorageKeyRemember)){
            
            self.doLogin(
            		savedCredentials.organization,
					savedCredentials.userid,
					savedCredentials.password,true,function(){
        
                $(self.container).html(template({
                    Config:Config,
                    savedCredentials: savedCredentials
                }));
            
                self.onLoad();
                
            });
            
        } if(this.isGuest){
            
            self.doGuestLogin(function(){
        
                //location.href = "/404";
                
            });
            
        } else{
            
            $(this.container).html(template({
                Config:Config,
                savedCredentials: savedCredentials
            }));
            
            this.onLoad();
        
        }
        
        return this;

    },

    onLoad: function(){
        
        var self = this;

        $('#tb-organization').on('keyup',function(e){
            
            var code = e.which;
            
            if (code==13) {
                e.preventDefault();

            	var userid = $('#tb-username').val();
                var password = $('#tb-password').val();
                var organization = $('#tb-organization').val();

                self.doLogin(organization,userid,password,$('#checkbox-remember').is(":checked"),function(){
                    $('#label-errormsg').text(Utils.l10n('Failed to login'));
                });
            
            }

        });


        $('#tb-username').on('keyup',function(e){
            
            var code = e.which;
            
            if (code==13) {
                e.preventDefault();

            	var userid = $('#tb-username').val();
                var password = $('#tb-password').val();
                var organization = $('#tb-organization').val();


                self.doLogin(organization,userid,password,$('#checkbox-remember').is(":checked"),function(){
                    $('#label-errormsg').text(Utils.l10n('Failed to login'));
                });
            
            }

        });

        $('#tb-password').on('keyup',function(e){
            
            var code = e.which;
            
            if (code==13) {
                e.preventDefault();

            	var userid = $('#tb-username').val();
                var password = $('#tb-password').val();
				var organization = $('#tb-organization').val();
				
                self.doLogin(organization,userid,password,$('#checkbox-remember').is(":checked"),function(){
                    $('#label-errormsg').text(Utils.l10n('Failed to login'));
                });
            
            }

        });


        $('#btn-login').on('click',function(){
            
            var userid = $('#tb-username').val();
            var password = $('#tb-password').val();
            var organization = $('#tb-organization').val();
            
            self.doLogin(organization,userid,password,function(){
                $('#label-errormsg').text(Utils.l10n('Failed to login'));
            });
            
        });
        
        Backbone.trigger(Const.NotificationUpdateWindowSize);
        
    },
    
    doGuestLogin: function(onError){
        
        var temporaryUserId = localStorage.get(Const.LocalStorageKeyTemporaryUserId);
        
        if(!temporaryUserId){
            
            temporaryUserId = Utils.getRandomString(32);
            
            localStorage.set(Const.LocalStorageKeyTemporaryUserId,temporaryUserId);
            
        }
        
        var organizationId = window.guestMode.organizationId;
        
        GuestSigninClient.send(organizationId,temporaryUserId,function(data){

            if(data.user && !_.isEmpty(data.newToken)){

                loginUserManager.setUser(data.user);
                loginUserManager.setToken(data.newToken);
                loginUserManager.organization = data.organization;
                
                SocketIOManager.init();
                
                Utils.goPage('open');
                
            } else {
                
                if(onError){
                    onError();
                }

            }

            $('#btn-login').removeAttr('disabled');
            $('#btn-login').removeClass('disabled');
            $('#btn-login i').addClass('hide');
        
        },function(errCode){

            $('#btn-login').removeAttr('disabled');
            $('#btn-login').removeClass('disabled');
            $('#btn-login i').addClass('hide');
            
            if(onError){
                onError();
            }

        });
        
        onError();
        
    },
    
    doLogin: function(organization,userid,password,saveCrednetials,onError){
        
        $('#alert-error').hide();

        // remember password
        if(saveCrednetials){
            
            localStorage.set(Const.LocalStorageKeyRemember,true);
            localStorage.set(Const.LocalStorageKeyUserId,userid);
            localStorage.set(Const.LocalStorageKeyPassword,password);
            localStorage.set(Const.LocalStorageKeyOrganization,organization);

        } else {
            
            localStorage.del(Const.LocalStorageKeyRemember);
            localStorage.del(Const.LocalStorageKeyUserId);
            localStorage.del(Const.LocalStorageKeyPassword);
            localStorage.del(Const.LocalStorageKeyOrganization);


        }
            
        $('#btn-login').attr('disabled','disabled');
        $('#btn-login').addClass('disabled');
        $('#btn-login i').removeClass('hide');

        SigninClient.send(organization,userid,password,function(data){
            
            if(data.user && !_.isEmpty(data.newToken)){

                loginUserManager.setUser(data.user);
                loginUserManager.setToken(data.newToken);
                loginUserManager.organization = data.organization;
                
                SocketIOManager.init();
                
                Utils.goPage('open');
                
            } else {
                
                if(onError){
                    onError();
                }

            }

            $('#btn-login').removeAttr('disabled');
            $('#btn-login').removeClass('disabled');
            $('#btn-login i').addClass('hide');
        
        },function(errCode){

            $('#btn-login').removeAttr('disabled');
            $('#btn-login').removeClass('disabled');
            $('#btn-login i').addClass('hide');
            
            $('#alert-error').show();

            if(errCode == "4000061"){
                $('#error-title').text(Utils.l10n('Device not allowed'));
                $('#error-desc').text(Utils.l10n('Please contact to admin.'));
            }else {
                $('#error-title').text(Utils.l10n('Failed to login'));
                $('#error-desc').text(Utils.l10n('Please input correct login credentials.'));
            }

            if(onError){
                onError();
            }

        });
        
    }
    
});

module.exports = SigninView;
