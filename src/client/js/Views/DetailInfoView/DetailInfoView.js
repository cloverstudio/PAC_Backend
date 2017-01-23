var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('lodash');
var bootstrapSwitch = require('bootstrap-switch');

var Utils = require('../../lib/utils');
var UIUtils = require('../../lib/UIUtils');
var Const = require('../../lib/consts');
var Config = require('../../lib/init');

var NotificationManager = require('../../lib/NotificationManager');
var loginUserManager = require('../../lib/loginUserManager');

var template = require('./DetailInfoView.hbs');
var templateDetailUser = require('./UserDetail.hbs');
var templateDetailGroup = require('./GroupDetail.hbs');
var templateDetailRoom = require('./RoomDetail.hbs');
var templateOnlineUserList = require('./OnlineUserList.hbs');

var ConfirmDialog = require('../Modals/ConfirmDialog/ConfirmDialog');
var LeaveRoomClient = require('../../lib/APIClients/LeaveRoomClient');
var GroupUserListClient = require('../../lib/APIClients/GroupUserListClient');
var RoomUserListClient = require('../../lib/APIClients/RoomUserListClient');
var UserDetailClient = require('../../lib/APIClients/UserDetailClient');
var MuteClient = require('../../lib/APIClients/MuteClient');
var BlockClient = require('../../lib/APIClients/BlockClient');

var DetailInfoView = Backbone.View.extend({
    
    currentChatData:null,
    
    initialize: function(options) {
        this.container = options.container;
        this.render();
    },

    render: function() {
        
        $(this.container).html(template({
            Config:Config
        }));
        
        this.onLoad();
        
        return this;

    },

    onLoad: function(){
        
        var self = this;
        
        Backbone.on(Const.NotificationSelectMessage, function(obj){
            self.showTab("detail");

            $('#message-info-title').css('display','block');
            $("#messages-tab .tab-selector").removeClass('selected');
            $("#messages-tab-detail").addClass('selected');
            
        });
        
        // tab handling
        $("#messages-tab .tab-selector").on('click',function(){

            var tabId = $(this).attr('tab');
            
            $("#messages-tab .tab-selector").removeClass('selected');
            $(this).addClass('selected');
            
            self.showTab(tabId);
    
        });
        
        Backbone.on(Const.NotificationOpenChat, function(obj){
            
            $('#messages-tab-detail-panel').html('');
            $('#messages-tab').css('display','block');
            $('#message-info-title').css('display','none');

            self.currentChatData = obj;
            
            var detailTemplate = null;
            
            var notificationKey = "";
            
            if(obj.user){
                detailTemplate = templateDetailUser;
                notificationKey = obj.user._id;
            }

            if(obj.group){
                detailTemplate = templateDetailGroup;
                notificationKey = obj.group._id;
                
                self.getUserList(GroupUserListClient,obj.group._id);
            }

            if(obj.room){
                detailTemplate = templateDetailRoom;
                notificationKey = obj.room._id;
                
                self.getUserList(RoomUserListClient,obj.room._id);
            }
            
            if(!detailTemplate)
                return;

            obj.loginUser = loginUserManager.getUser();
            
            var html = detailTemplate(obj)
            
            $('#chat-detail').html(html);

            if($("[name='checkbox-notify']").bootstrapSwitch){

                $("[name='checkbox-notify']").bootstrapSwitch({
                    onText: Utils.l10n("Mute"),
                    offText: Utils.l10n("Notify"),
                    state: true,
                    onSwitchChange:function(event,state){
                        
                        self.updateMute(state);
                        
                    }
                });
            
            }

            if($("[name='checkbox-block']").bootstrapSwitch){

                $("[name='checkbox-block']").bootstrapSwitch({
                    onText: Utils.l10n("Block"),
                    offText: Utils.l10n("Unblock"),
                    state: true,
                    onSwitchChange:function(event,state){
                        
                        self.updateBlock(state);
                        
                    }
                });
            
            }

            $('#btn-groupdetail').on('click',function(){
                
                var GroupDetailDialog = require('../Modals/GroupDetail/GroupDetail');
                GroupDetailDialog.show(loginUserManager.currentGroup);
                
            });

            $('#btn-leaveroom').on('click',function(){
                
                ConfirmDialog.show(Utils.l10n('Confirm'),
                                    Utils.l10n('Please press OK to proceed.'),
                                    function(){

                    LeaveRoomClient.send(loginUserManager.currentRoom._id,function(response){
                        
                        Backbone.trigger(Const.NotificationRemoveRoom,self.currentChatData);
                        
                    },function(errCode){

                        var message = "";
                        
                        if(Const.ErrorCodes[errCode])
                            message = Utils.l10n(Const.ErrorCodes[errCode]);
                        else
                            message = Utils.l10n("Critical Error");
                        
                        var Alert = require('../Modals/AlertDialog/AlertDialog');
                        Alert.show(Utils.l10n('API Error'),message);
                        
                    });

                });

            });

            $('#btn-editroom').on('click',function(){
                
                var updateRoomDialog = require('../Modals/UpdateRoom/UpdateRoom');
                updateRoomDialog.show(loginUserManager.currentRoom);
                
            });

            $('#btn-roomdetail').on('click',function(){
                
                var RoomDetailDialog = require('../Modals/RoomDetail/RoomDetail');
                RoomDetailDialog.show(loginUserManager.currentRoom);
                
            });

            $('#btn-audiocall').on('click',function(){
                
                Backbone.trigger(Const.NotificationStartCalling,{
                    type: Const.callTypeOutgoing,
                    mediaType:Const.callMediaTypeAudio,
                    target:self.currentChatData.user
                });
                
            });

            $('#btn-videocall').on('click',function(){
                
                 Backbone.trigger(Const.NotificationStartCalling,{
                     type: Const.callTypeOutgoing,
                     mediaType:Const.callMediaTypeVideo,
                     target:self.currentChatData.user
                 });
                 
            });
            
            self.loadMuteBlockSwitch();

        });
    
    },
    
    getUserList:function(client,identifier){
        
        var userList = [];
        
        var page = 1;
        
        function loopUntilFinsh(client,identifier,finish){
            
            client.send(identifier,page,function(res){
                
                page++;
                userList = userList.concat(res.list);
                
                if(res.list.length > 0)
                    loopUntilFinsh(client,identifier,finish);
                else
                    finish(userList);
                    
            },function(errCode){
                
            });
            
        }
        
        loopUntilFinsh(client,identifier,function(){
            
            var onlineUsers = _.filter(userList,function(user){
                
                return user.onlineStatus == 1;
                
            });
            
            $('#chat-detail .onlineusers').html(templateOnlineUserList({
                list:onlineUsers
            }));
            
        });
        
    },
    
    showTab: function(tabId){
        
        $('#detailinfo-container .tab-panel').css('display','none');
        
        var targetPanel = "";
        
        if(tabId == 'file'){
            targetPanel = "#messages-tab-files-panel";
        }

        if(tabId == 'picture'){
            targetPanel = "#messages-tab-pictures-panel";
        }

        if(tabId == 'url'){
            targetPanel = "#messages-tab-urls-panel";
        }
        
        if(tabId == 'detail'){
            targetPanel = "#messages-tab-detail-panel";
        }
        
        $(targetPanel).css('display','block');
        
    },

    loadMuteBlockSwitch: function(){

        var self = this;

        UserDetailClient.send(loginUserManager.getUser()._id,function(response){

            var user = response.user;

            if(!response)
                return;
            
            var targetId = "";
            
            if(self.currentChatData.user){
                targetId = self.currentChatData.user._id;
            }

            if(self.currentChatData.group){
                targetId = self.currentChatData.group._id;
            }

            if(self.currentChatData.room){
                targetId = self.currentChatData.room._id;
            }

            if(_.isArray(user.muted)){

                if(user.muted.indexOf(targetId) != -1){

                    $("[name='checkbox-notify']").bootstrapSwitch('state',false,false);

                } else {

                    $("[name='checkbox-notify']").bootstrapSwitch('state',true,true);

                }

            }

            if(_.isArray(user.blocked)){

                if(user.blocked.indexOf(targetId) != -1){

                    $("[name='checkbox-block']").bootstrapSwitch('state',false,false);

                } else {

                    $("[name='checkbox-block']").bootstrapSwitch('state',true,true);

                }

            }

            

        },function(errCode){

        })
    },

    updateMute : function(state){

        var targetId = "";
        var type = 1;
        if(this.currentChatData.user){
            targetId = this.currentChatData.user._id;
        }

        if(this.currentChatData.group){
            targetId = this.currentChatData.group._id;
            type = 2;
        }

        if(this.currentChatData.room){
            targetId = this.currentChatData.room._id;
            type = 3;
        }

        MuteClient.send(state,targetId,type,function(response){

        },function(errcode){

        })

    },
    
    updateBlock : function(state){

        var targetId = "";
        
        if(this.currentChatData.user){

            targetId = this.currentChatData.user._id;

            BlockClient.send(state,targetId,function(response){

            },function(errcode){

            })

        }
    }

});

module.exports = DetailInfoView;
