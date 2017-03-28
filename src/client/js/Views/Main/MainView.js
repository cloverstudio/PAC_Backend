var Backbone = require('backbone');
var _ = require('lodash');

var Utils = require('../../lib/utils');
var Const = require('../../lib/consts');
var Config = require('../../lib/init');

var template = require('./MainView.hbs');

var SideMenu = require('../SideMenu/SideMenu');
var loginUserManager = require('../../lib/loginUserManager');
var ChatManager = require('../../lib/ChatManager');

var UserDetailClient = require('../../lib/APIClients/UserDetailClient');

var MainView = Backbone.View.extend({
    
    container : "",
    views : [],
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
        
        if(!loginUserManager.getUser().isGuest){
            
            var View1 = require('../Sidebar/SidebarView.js');   
            var view1 = new View1({
                container : "#sidebar",
                isGuest: loginUserManager.getUser().isGuest
            });
            
            this.views.push(view1);
            

            var View3 = require('../DetailInfoView/DetailInfoView.js');   
            var view3 = new View3({
                container : "#detailinfo-container"
            });

            this.views.push(view3);
            
        } else {
            
            // automatically open chat for guest
            var userId = window.guestMode.userId;
            
            UserDetailClient.send(userId,function(data){
                
                ChatManager.openChatByUser(data.user);

                $('#sidebar').remove();
                $('#detailinfo-container').remove();
                
                $('#main-container').removeClass('col-md-6');
                $('#main-container').addClass('col-md-12');
                
            },function(){
                
                location.href='/404';
                
            });
        }
        
        var View2 = require('../Header/HeaderView.js');   
        var view2 = new View2({
            container : "#header"
        });
        
        this.views.push(view2);
        
        
        var View4 = require('../CallView/CallRequestView.js');   
        var view4 = new View4({
            container : "#body"
        });
        
        this.views.push(view4);
        
        Backbone.on(Const.NotificationShowSearch, function(obj){

            var View = require('../Search/SearchView.js');   
            var view = new View({
                container : "#main-container"
            });
            
        });

        Backbone.on(Const.NotificationShowFavorite, function(obj){
 
            var View = require('../Favorite/FavoriteView.js');   
            var view = new View({
                container : "#main-container"
            });
            
        });

        Backbone.on(Const.NotificationShowWebHook, function(obj){
 
            var View = require('../WebHook/WebHookView.js');   
            var view = new View({
                container : "#main-container"
            });
            
        });
        
        Backbone.on(Const.NotificationUpdateUnreadCount, function(count){
            
            if(count > 0){
                document.title = Config.AppTitle + " (" + count + ")";
            }else{
                document.title = Config.AppTitle;
            }
            
        });

        Backbone.trigger(Const.NotificationUpdateWindowSize);

    },
    
    destroy: function(){
        
        console.log('main destroy');
        
        _.forEach(this.views,function(view){
            
            if(view.destroy)
                view.destroy();
             
        });
        
    }
    
});

module.exports = MainView;
