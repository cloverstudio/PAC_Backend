var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('lodash');
var validator = require('validator');
var bootstrapSwitch = require('bootstrap-switch');

var Config = require('../../lib/init');
var Const = require('../../lib/consts.js');
var Utils = require('../../lib/utils.js');

var loginUserManager = require('../../lib/loginUserManager');
var NotificationManager = require('../../lib/NotificationManager');

var ConfirmDialog = require('../Modals/ConfirmDialog/ConfirmDialog');

var LeaveRoomClient = require('../../lib/APIClients/LeaveRoomClient');
var MarkAllAsReadClient = require('../../lib/APIClients/MarkAllAsReadClient');

var template = require('./SideMenu.hbs');
var templateUser = require('./SubMenuUser.hbs');
var templateGroup = require('./SubMenuGroup.hbs');
var templateRoom = require('./SubMenuRoom.hbs');

var SideMenu = {
    
    $: function(selector){
        if(!selector)
            selector = '';
            
        return $("#sidemenu " + selector);
    },
    tuggle: function() {
    
        var self = this;
        
        if(!$( "#sidemenu-cover" )[0]){

            // show
            $('body').append(template({
                loginUser: loginUserManager.getUser(),
                organization: loginUserManager.organization,
                isGuest: loginUserManager.getUser().isGuest
            }));
            
            var notificationKey = "";
             
            $( "#sidemenu-cover" ).css('opacity',0);
            
            $( "#sidemenu-cover" ).animate({
                opacity: 0.75,
            }, 200, function() {

            });
            
            self.$().animate({
                left: 0
            }, 200, function() {

            });
            
            $( "#sidemenu-cover" ).on('click',function(){
                
                self.tuggle();
                    
            });
            
            self.UIEvents();
            
        }else{
            
            // hide
            $( "#sidemenu-cover" ).animate({
                opacity: 0,
            }, 200, function() {

            });
            
            self.$().animate({
                left: -1 * self.$().width()
            }, 200, function() {
                
            
                self.$().remove();
                $('#sidemenu-cover').remove();
            
                
            });

        }
        
    },
    hide: function(onFinish) {
        

        
    },
    UIEvents: function(){
        
        var self = this;
        
        this.$('.img-holder').on('click',function(){
            
            self.tuggle();
            
            var modal = require('../Modals/EditProfile/EditProfile');
            modal.show(function(){ 
                
            });
            
        });

        this.$('#btn-changeprofile').on('click',function(){
            
            self.tuggle();
            
            var modal = require('../Modals/EditProfile/EditProfile');
            modal.show(function(){ 
                
            });
            
        });
        

        $("#btn-new-room").click(function(e) {
            e.preventDefault();
            
            self.tuggle();
            
            var modal = require('../Modals/CreateRoom/CreateRoom');
            modal.show(function(){ 
                
            });
            
        });
        
        this.$("#btn-editprofile").click(function(e) {
            e.preventDefault();
            
            self.tuggle();
            
            var modal = require('../Modals/EditProfile/EditProfile');
            modal.show(function(){ 

            });
            
        });

        this.$("#btn-changepassword").click(function(e) {
            e.preventDefault();
            
            self.tuggle();
            
            var modal = require('../Modals/ChangePassword/ChangePassword');
            modal.show();
        });
        
        this.$("#btn-logout").click(function(e) {
            e.preventDefault();
            
            self.tuggle();
            
            Utils.goPage('logout');
            
        });

        this.$("#btn-search").click(function(e) {
            
            e.preventDefault();
            
            self.tuggle();
            
            Utils.goPage('search');
            
        });
        
        this.$("#btn-favorite").click(function(e) {
            
            e.preventDefault();
            
            self.tuggle();
            
            Utils.goPage('favorite');
            
        });

        this.$("#btn-webhook").click(function(e) {

            e.preventDefault();
            
            self.tuggle();
            
            Utils.goPage('webhook');
            
        });


        
        this.$("#btn-markall").click(function(e) {
            e.preventDefault();
            
            self.tuggle();
            
            MarkAllAsReadClient.send(function(){
                
                Backbone.trigger(Const.NotificationRefreshHistory);
                
            },function(errorCode){
                var UIUtils = require('../../lib/UIUtils');
                UIUtils.handleAPIErrors(errorCode);
            });
            
        });
        
    }
    
    
}
module.exports = SideMenu;