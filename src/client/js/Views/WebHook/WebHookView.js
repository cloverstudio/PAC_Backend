var Backbone = require('backbone');
var _ = require('lodash');

var Utils = require('../../lib/utils');
var UIUtils = require('../../lib/UIUtils');
var Const = require('../../lib/consts');
var Config = require('../../lib/init');

var template = require('./HebHookViewMain.hbs');
var loginUserManager = require('../../lib/loginUserManager');

var newHookDialog = require('../Modals/NewHook/NewHook');
var confirmDialog = require('../Modals/ConfirmDialog/ConfirmDialog');

var MyRoomListClient = require('../../lib/APIClients/MyRoomListClient');
var HookListClient = require('../../lib/APIClients/HookListClient');
var DeleteHookClient = require('../../lib/APIClients/DeleteHookClient');
var UpdateHookClient = require('../../lib/APIClients/UpdateHookClient');

var WebHookView = Backbone.View.extend({
    
    dataList : null,
    roomList: null,
    initialize: function(options) {
        this.container = options.container;
        this.render();
    },

    render: function() {

        this.onLoad();

        $(this.container).html("");
            
        return this;

    },

    onLoad: function(){

        var self = this;

        Backbone.trigger(Const.NotificationUpdateHeader,{
            online: null,
            img: null,
            title: Utils.l10n("WebHook Settings"),
            description: ""
        });

        this.loadList();
        
    },
    
    loadList: function(){
        
        var self = this;
        
        HookListClient.send(function(res){
            
            self.dataList = res.hooks;
            
            MyRoomListClient.send(function(resRoom){
                
                self.roomList = resRoom.rooms;

                $(self.container).html(template({
                    list:res.hooks,
                    rooms:resRoom.rooms
                }));
                
                self.afterRender();
            
            },function(errCode){
                UIUtils.handleAPIErrors(errCode);
            });
            
        },function(errCode){
            UIUtils.handleAPIErrors(errCode);
        });
    },
    
    afterRender: function(){
        
        var self = this;
        
        Backbone.trigger(Const.NotificationUpdateWindowSize);
        
        $('#btn-newhook').unbind().on('click',function(){

            newHookDialog.show(function(){
                self.loadList();
            });

        });
        
        $('.btn-delete').on('click',function(){
           
           var hookId = $(this).attr('hookid');
           
           var hook = _.find(self.dataList,function(row){
               
               return row._id == hookId;
               
           });

           if(hook){
               
               confirmDialog.show(
                   Utils.l10n('Delete WebHook'),
                   Utils.l10n('Please press OK to proceed'),
                   function(){
                       
                       DeleteHookClient.send(hook.hookType,hook._id,function(res){
                           
                           self.loadList()
                           
                       },function(errCode){
                           
                           UIUtils.handleAPIErrors(errCode);
                           
                       });
                       
                   },
                   function(){
                       
                       // do nothing
                   }
                   
               )
               
           }
            
        });
        
        $('.read').unbind().on('click',function(){
            
            $(this).css('display','none');
            $(this).parent().find('.edit').css('display','block');
            
        });

        $('.edit .btn-cancel').unbind().on('click',function(){
            
            $(this).parent().parent().css('display','none');
            $(this).parent().parent().parent().find('.read').css('display','block');
            
        });

        $('.edit .btn-save').unbind().on('click',function(){
            
            var hookId = $(this).attr('hookid');

            var hook = _.find(self.dataList,function(row){

                return row._id == hookId;

            });

            if(!hook)
                return;
            
            hook.targetType = Const.chatTypeRoom;
            hook.targetId = $('#hookselect-'+hookId).val();
            
            UpdateHookClient.send(hook,function(res){
                
                self.loadList()
                
            },function(errCode){
                
                UIUtils.handleAPIErrors(errCode);
                
            });
                       
            
        });
        
    }
});

module.exports = WebHookView;
