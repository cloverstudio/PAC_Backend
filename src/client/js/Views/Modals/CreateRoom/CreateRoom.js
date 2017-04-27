var $ = require('jquery');
var _ = require('lodash');
var validator = require('validator');
var Backbone = require('backbone');

var Const = require('../../../lib/consts.js');

var Utils = require('../../../lib/utils.js');
var template = require('./CreateRoom.hbs');

var loginUserManager = require('../../../lib/loginUserManager');
var UsersSelectTextBox = require('../../Parts/UsersSelectTextBox/UsersSelectTextBox');

var ChatManager = require('../../../lib/ChatManager');

var CreateRoomClient = require('../../../lib/APIClients/CreateRoomClient');

var CreateRoom = {
    ustb : null,
    $: function(selector){
        return $("#modal-newroom " + selector)
    },
    show: function(onRetry) {
    
        var self = this;
        
        $('body').append(template({
        }));
        
        this.$('').on('hidden.bs.modal', function(e) {
            self.$('').remove();
            
            if(self.ustb){
                self.ustb.remove();
            }
            
        })

        this.$('').on('show.bs.modal', function (e) {
            self.load();
        })
        
        this.$('').modal('show');
        
        this.$('#modal-btn-close').unbind().on('click', function() {
            self.hide();
        });
    },
    hide: function(onFinish) {
        
        var self = this;
        
        this.$('').on('hidden.bs.modal', function(e) {
            self.$('').remove();

            if(self.ustb){
                self.ustb.remove();
            }
            
            if (!_.isUndefined(onFinish)) {
                onFinish();
            }
        })
        
        this.$('').modal('hide');
    },
    load : function(){
        
        var self = this;
        
        this.$('#modal-btn-save').unbind().on('click', function() {
            
            self.save();
            
        });
        
        this.ustb = new UsersSelectTextBox("#userselect");
        
    },
    save : function(){
        
        var self = this;
        
        this.$('.alert-danger').hide();
        
        var errorMessage = "";
        
        if(!_.isEmpty(errorMessage)){
            
            this.$('.alert-danger').text(errorMessage);
            this.$('.alert-danger').show();
         
            return;   
        
        }
        
        this.$('#modal-btn-save').attr('disabled','disabled');
        this.$('.progress').show();
        
        var userIds = "";
        _.forEach(this.ustb.selectedUsers,function(user){
            userIds += user._id + ",";
        });
        
        var name = this.$('form [name="display-name"]').val();
        var description = this.$('form [name="description"]').val();
        var file = this.$('form [name="file"]')[0].files[0];
                
        CreateRoomClient.send(userIds,name,description,file,function(response){
            
            self.$('#modal-btn-save').removeAttr('disabled');
            self.$('.progress').hide();

            self.$('.alert-success').show();
            _.debounce(function(){
                
                // open chat
                self.$('').modal('hide');
                
                var room = response.data.room;
                
                ChatManager.openChatByRoom(room);
                
                Backbone.trigger(Const.NotificationRefreshHistory);
            
            },500)();

        },function(progress){
            
            self.$('.progress-bar').css('width',progress * 100 + "%");
    
        },function(errCode){

            var message = "";
            
            if(Const.ErrorCodes[errCode])
                message = Utils.l10n(Const.ErrorCodes[errCode]);
            else
                message = Utils.l10n("No internet connection, please try again later.");

            self.$('.alert-danger').text(message);
            self.$('.alert-danger').show();

            self.$('.progress').hide();           
            self.$('#modal-btn-save').removeAttr('disabled'); 
            
        });
        
    }
    
}
module.exports = CreateRoom;