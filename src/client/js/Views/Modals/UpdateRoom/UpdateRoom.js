var $ = require('jquery');
var _ = require('lodash');
var async = require('async');
var validator = require('validator');
var Backbone = require('backbone');

var Const = require('../../../lib/consts.js');

var Utils = require('../../../lib/utils.js');
var UIUtils = require('../../../lib/UIUtils');

var template = require('./UpdateRoom.hbs');

var loginUserManager = require('../../../lib/loginUserManager');
var UsersSelectTextBox = require('../../Parts/UsersSelectTextBox/UsersSelectTextBox');

var ChatManager = require('../../../lib/ChatManager');

var UpdateRoomClient = require('../../../lib/APIClients/UpdateRoomClient');
var RoomUserListClient = require('../../../lib/APIClients/RoomUserListClient');
var AddUsersToRoomClient = require('../../../lib/APIClients/AddUsersToRoomClient');
var RemoveUsersFromRoomClient = require('../../../lib/APIClients/RemoveUsersFromRoomClient');

var UpdateRoom = {
    roomObj : null,
    $: function(selector){
        return $("#modal-updateroom " + selector)
    },
    show: function(roomObj) {
        
        if(!roomObj)
            return;
            
        var self = this;
        
        this.roomObj = roomObj;
        
        $('body').append(template({
        }));
        
        this.$('').on('hidden.bs.modal', function(e) {
            self.$('').remove();
        })

        this.$('').on('show.bs.modal', function (e) {
            self.load();
        })

        this.$('form [name="display-name"]').val(roomObj.name);
        this.$('form [name="description"]').val(roomObj.description);
        
        this.$('').modal('show');
        this.$('#modal-btn-close').unbind().on('click', function() {
            self.hide();
        });
    },
    hide: function(onFinish) {
        
        var self = this;
        
        this.$('').on('hidden.bs.modal', function(e) {
            self.$('').remove();
            
            if (!_.isUndefined(onFinish)) {
                onFinish();
            }
        })
        
        this.$('').modal('hide');
    },
    load : function(){
        
        var self = this;
        
        // get user list
        RoomUserListClient.send(this.roomObj._id,'all',function(data){
            
            self.ustb = new UsersSelectTextBox("#userselect",[loginUserManager.getUser()._id]);
            self.ustb.selectUsers(data.list);
            self.roomObj.users = _.map(data.list, "_id");
            
        },function(errorCode){
            
            UIUtils.handleAPIErrors(errorCode);
            self.hide();
            
        });
        
        this.$('#modal-btn-save').unbind().on('click', function() {
            
            self.save();
            
        });

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

        async.waterfall( [function(done){
                
                var result = {};
                
                self.updateMetaInfo(function(errCode,response){
                    
                    result.response1 = response;
                    self.$('.progress-bar').css('width',"80%");
                    done(errCode,result);
                     
                });
                
            },
            function(result,done){

                self.addUsers(function(errCode,response){
                    
                    result.roomAddUsers = response;
                    self.$('.progress-bar').css('width',"90%");
                    done(errCode,result);
                     
                });
                
            },
            function(result,done){

                self.removeUsers(function(errCode,response){
                    
                    self.$('.progress-bar').css('width',"100%");
                    result.roomRemoveUsers = response;
                    done(errCode,result);
                     
                });
                
            }
        ],
        function(errCode,result){

            if(errCode){
                var message = "";
                
                if(Const.ErrorCodes[errCode])
                    message = Utils.l10n(Const.ErrorCodes[errCode]);
                else
                    message = Utils.l10n("No internet connection, please try again later.");

                self.$('.alert-danger').text(message);
                self.$('.alert-danger').show();

                self.$('.progress').hide();           
                self.$('#modal-btn-save').removeAttr('disabled');
                
                return; 
            }
            
            var response = result.response1;
            
            self.$('#modal-btn-save').removeAttr('disabled');
            self.$('.progress').hide();

            self.$('.alert-success').show();

            _.debounce(function(){
                
                if(response.data)
                    ChatManager.open(Const.chatTypeRoom + "-" + response.data.room._id);
                
                // open chat
                self.$('').modal('hide');
                
                var room = response.data.room;
                room.users = result.roomRemoveUsers.room.users;

                var url = "";
                
                if(room.avatar && room.avatar && room.avatar.thumbnail)
                    url = "/api/v2/avatar/room/" + room.avatar.thumbnail.nameOnServer;

                loginUserManager.openChat({
                    room: room
                });

                Backbone.trigger(Const.NotificationRefreshHistory);

                Backbone.trigger(Const.NotificationUpdateHeader,{
                    img: url,
                    title: room.name,
                    description: room.description
                });

            },500)();
            
        });
       
    },
    addUsers:function(callBack){
        
        var selectedUsers = _.pluck(this.ustb.selectedUsers,"_id");
        var originalUsers = this.roomObj.users;
        var usersToAdd = _.filter(selectedUsers,function(userId){
            
            return originalUsers.indexOf(userId) == -1
             
        });
        
        AddUsersToRoomClient.send(this.roomObj._id,usersToAdd,function(data){
            
            callBack(null,data);
            
        },function(errCode){
            
            callBack(errCode,null);
            
        });
        
    },
    removeUsers:function(callBack){

        var selectedUsers = _.pluck(this.ustb.selectedUsers,"_id");
        var originalUsers = this.roomObj.users;
        var usersToRemove = _.filter(originalUsers,function(userId){
            
            return selectedUsers.indexOf(userId) == -1
             
        });
        
        
        RemoveUsersFromRoomClient.send(this.roomObj._id,usersToRemove,function(data){
            
            callBack(null,data);
            
        },function(errCode){
            
            callBack(errCode,null);
            
        });
        
        
    },
    updateMetaInfo:function(callBack){
        
        var name = this.$('form [name="display-name"]').val();
        var description = this.$('form [name="description"]').val();
        var file = this.$('form [name="file"]')[0].files[0];

        UpdateRoomClient.send(this.roomObj._id,name,description,file,function(response){
            
            callBack(null,response);

        },function(progress){
            
            self.$('.progress-bar').css('width',progress * 80 + "%");
    
        },function(errCode){

            callBack(errCode,null);
            
        });
        
    }
    
}
module.exports = UpdateRoom;