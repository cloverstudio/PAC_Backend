var Backbone = require('backbone');
var _ = require('lodash');

var utils = require('./lib/utils');
var Const = require('./lib/consts');

var loginUserManager = require('./lib/loginUserManager');
var localStorage = require('./lib/localstorageManager');
var ChatManager = require('./lib/ChatManager');
var SocketIOManager = require('./lib/SocketIOManager');

var SignoutClient = require('./lib/APIClients/SignoutClient');

var Routing = function(){
    
    // setting up router
    var AppRouter = Backbone.Router.extend({
        routes: {
            "login": "login",
            "logout": "logout",
            "tokenExpired": "tokenExpired",
            "loginManually": "loginManually",
            "main": "main",
            "open": "open",
            "search": "search",
            "favorite": "favorite",
            "webhook": "webhook",
            "*actions": "defaultRoute"
        }
    });
    
    // Initiate the router
    var appRouter = new AppRouter;
   
    var MainView = require('./Views/Main/MainView.js');   
    var mainView = null;
            
    appRouter.on('route:defaultRoute', function(action) {
        
        utils.goPage('login')
        
    });

    appRouter.on('route:logout', function(action) {

        if(mainView){
            console.log('start to destroy');
            mainView.destroy();
        }

        SignoutClient.send(function(){

            loginUserManager.setUser(null);
            loginUserManager.setToken(null);
            loginUserManager.organization = null;
            
            localStorage.del(Const.LocalStorageKeyRemember);
            localStorage.del(Const.LocalStorageKeyUserId);
            localStorage.del(Const.LocalStorageKeyPassword);

            SocketIOManager.disconnect();
            Backbone.trigger(Const.NotificationUpdateUnreadCount,0);

            utils.goPage('login');
        
        },function(){
            
        });
        
    });
    
    appRouter.on('route:login', function(action) {

        if(mainView){
            mainView.destroy();
        }
            
        var View = require('./Views/Signin/SigninView.js');   
        var view = new View({
            container : "#body"
        });
        
    });

    appRouter.on('route:tokenExpired', function(action) {
        
        loginUserManager.setUser(null);
        loginUserManager.setToken(null);

        utils.goPage('loginManually');
        
    });
    
    appRouter.on('route:loginManually', function(action) {
        
        var View = require('./Views/Signin/SigninView.js');   
        var view = new View({
            container : "#body",
            disableAutoLogin: true
        });
        
    });
    
    appRouter.on('route:open', function(action) {

        var accessToken = loginUserManager.getToken();
        
        if(!accessToken){
            utils.goPage('login');
        }else{
            
            mainView = new MainView({
                container : "#body"
            });

        }

    });
    
    appRouter.on('route:main', function(action) {

        var accessToken = loginUserManager.getToken();
        
        if(!accessToken){
            utils.goPage('login');
        }else{
            
            if(!mainView){
                mainView = new MainView({
                    container : "#body"
                });
            }else{
                // do nothings if mainView is alreay shown
            }

        }

    });

    appRouter.on('route:search', function(action) {
        
        ChatManager.close();
        
        var accessToken = loginUserManager.getToken();
        
        if(!accessToken){
            utils.goPage('login');
        }else{

            Backbone.trigger(Const.NotificationShowSearch);
        
        }
        
    });

    appRouter.on('route:favorite', function(action) {
        
        ChatManager.close();
        
        var accessToken = loginUserManager.getToken();
        
        if(!accessToken){
            utils.goPage('login');
        }else{

            Backbone.trigger(Const.NotificationShowFavorite);
        
        }
        
    });

    appRouter.on('route:webhook', function(action) {
        
        ChatManager.close();
        
        var accessToken = loginUserManager.getToken();
        
        if(!accessToken){
            utils.goPage('login');
        }else{

            Backbone.trigger(Const.NotificationShowWebHook);
        
        }
        
    });
    
}

// Exports ----------------------------------------------
module["exports"] = new Routing();

