var Backbone = require('backbone');
var _ = require('lodash');

var Utils = require('../../lib/utils');
var Const = require('../../lib/consts');
var Config = require('../../lib/init');

var template = require('./ChatView.hbs');

var SideMenu = require('../SideMenu/SideMenu');
var loginUserManager = require('../../lib/loginUserManager');
var ChatManager = require('../../lib/ChatManager');

var LoadMessageClient = require('../../lib/APIClients/Messaging/LoadMessageClient');

var ChatView = Backbone.View.extend({
    
    container : "",
    views : [],
    currentRoomId: '',
    lastMessageId: 0,
    initialize: function(options) {
        this.container = options.container;
        this.currentRoomId = options.roomId;
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
        
        this.loadNextMessage();

    },
    
    loadNextMessage: function(){

        var self = this;

        console.log('load next message');

        LoadMessageClient.send(this.currentRoomId,this.lastMessageId,function(res){
            
            console.log(res);

        },function(){

        });

    },
    destroy: function(){
        
        _.forEach(this.views,function(view){
            
            if(view.destroy)
                view.destroy();
             
        });
        
    }

});

module.exports = ChatView;
