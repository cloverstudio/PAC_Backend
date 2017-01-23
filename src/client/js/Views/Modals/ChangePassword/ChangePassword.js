var $ = require('jquery');
var _ = require('lodash');
var validator = require('validator');
var sha1 = require('sha1');

var Const = require('../../../lib/consts');
var Utils = require('../../../lib/utils.js');
var template = require('./ChangePassword.hbs');

var UpdateProfileClient = require('../../../lib/APIClients/UpdateProfileClient');
var loginUserManager = require('../../../lib/loginUserManager');
var ChangePasswordClient = require('../../../lib/APIClients/ChangePasswordClient');

var ChangePassword = {
    show: function(title, text, onRetry) {
    
        var self = this;
        
        $('body').append(template({
            title: title,
            text: text
        }));
        
        $('#modal-changepassword').on('hidden.bs.modal', function(e) {
            $('#modal-changepassword').remove();
            
        })

        $('#modal-changepassword').on('show.bs.modal', function (e) {
            self.load();

            var user = loginUserManager.getUser();
            $('form [name="display-name"]').val(user.name);

        })
        
        $('#modal-changepassword').modal('show');
        
        $('#modal-btn-close').unbind().on('click', function() {
            self.hide();
        });
        
    },
    hide: function(onFinish) {
    
        $('#modal-changepassword').on('hidden.bs.modal', function(e) {
        
            $('#modal-changepassword').remove();
            
            if (!_.isUndefined(onFinish)) {
                onFinish();
            }
        })
        
        $('#modal-changepassword').modal('hide');
    },
    load : function(){
        
        var self = this;
        
        $('#modal-btn-save').unbind().on('click', function() {
            
            self.save();
            
        });
        
    },
    save : function(){
        
        $('#modal-changepassword .alert-danger').hide();
        
        var errorMessage = this.validate();
                
        if(!_.isEmpty(errorMessage)){
            
            $('#modal-changepassword .alert-danger').text(errorMessage);
            $('#modal-changepassword .alert-danger').show();
         
            return;   
        
        }
        
        this.doSave();
        
    },
    validate : function(){
        
        var newPassword = $('form [name="new-password"]').val();
        var currentPassword = $('form [name="new-password"]').val();
        var newPasswordConfirm = $('form [name="new-password-confirm"]').val();
        
        var errorMessage = "";
        
		if(_.isEmpty(newPassword))
			errorMessage = Utils.l10n("Please input password.");
		else if(!validator.isAlphanumeric(newPassword)){
			errorMessage = Utils.l10n("Password must be alphanumerical.");
		} else if(!validator.isLength(newPassword,Const.credentialsMinLength)){
			errorMessage = Utils.l10n("Password must be at least ") + Const.credentialsMinLength + Utils.l10n(" characters.");
		} else if(newPassword != newPasswordConfirm){
			errorMessage = Utils.l10n("Passwords must be same.");
		}

        return errorMessage;
        
    },
    doSave : function(){
	    
        var self = this;
         
        var currentPassword = $('form [name="current-password"]').val();
        var newPassword = $('form [name="new-password"]').val();
        
        $('#modal-btn-save').attr('disabled','disabled');
        $('#modal-changepassword .progress').show();
        
        ChangePasswordClient.send({
            
            currentPassword:Utils.hash(currentPassword),
            newPassword:newPassword
            
        },function(data){
                             
            $('#modal-btn-save').removeAttr('disabled');
            $('#modal-changepassword .progress').hide();

            $('#modal-changepassword .alert-success').show();
            
            _.debounce(function(){
                
                self.hide();
                Utils.goPage('#logout');
                
            },1500)();

        },function(errCode){
            
            var message = "";
            
            if(Const.ErrorCodes[errCode])
                message = Utils.l10n(Const.ErrorCodes[errCode]);
            else
                message = Utils.l10n("Critical Error");
                
            $('#modal-changepassword .alert-danger').text(message);
            $('#modal-changepassword .alert-danger').show();

            $('#modal-changepassword .progress').hide();    
                   
            $('#modal-btn-save').removeAttr('disabled');
                      
        })
        
    }
    
}
module.exports = ChangePassword;