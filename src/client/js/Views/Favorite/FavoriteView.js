var Backbone = require('backbone');
var _ = require('lodash');

var Utils = require('../../lib/utils');
var UIUtils = require('../../lib/UIUtils');
var Const = require('../../lib/consts');
var Config = require('../../lib/init');

var template = require('./FavoriteView.hbs');
var templateList = require('./FavoriteResult.hbs');

var SideMenu = require('../SideMenu/SideMenu');

var favoriteListClient = require('../../lib/APIClients/FavoriteListMessageClient');
var removeFromFavoriteClient = require('../../lib/APIClients/RemoveFromFavoriteClient');

var ChatManager = require('../../lib/ChatManager');

var FavoriteView = Backbone.View.extend({
    
    container : "",
    currentPage : 1,
    isReachedToEnd: false,
    dataList : [],
    preventLastClick : false,
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
        
        this.loadNext();

        $("#favorite-result-contaier").on('scroll',function() {

            // check is bottom
            if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {

                self.loadNext();

            }

        });

        Backbone.trigger(Const.NotificationUpdateHeader,{
            online: null,
            img: null,
            title: Utils.l10n("Favorites"),
            description: ""
        });
        
    },
    
    loadNext: function(){
        
        var self = this;
        
        if(this.isReachedToEnd)
            return;
        
        favoriteListClient.send(this.currentPage,function(data){

            self.currentPage++;
            
            // show nothing if first attemp and empty result
            if(data.favorites.length == 0 && self.dataList.length == 0){
                self.renderAppend(data.favorites);
            }

            if(data.favorites.length == 0){
                self.isReachedToEnd = true;
                return;
            }

            self.dataList = self.dataList.concat(data.favorites);
            self.currentPage++;
            self.renderAppend(data.favorites);
            
        },function(errorCode){

            console.log(errorCode);
            UIUtils.handleAPIErrors(errorCode);

            
        });
        
    },

    renderAppend : function(list){

        var self = this;

        var html = templateList({
            list: list
        });

        $("#favorite-result-contaier").append(html);

        $('#favorite-result-contaier .search-result-row').unbind().on('click',function(){
            
            if(self.preventLastClick){
                self.preventLastClick = false;
                return;
            }
            
            var messageId = $(this).attr('id');
            self.startChat(messageId);

        });

        $('.btn-forward').unbind().on('click',function(e){
            
            e.preventDefault();
            self.preventLastClick = true;
            
            var messageId = $(this).attr('messageid');
            var ForwardMessageDialog = require("../Modals/ForwardMessage/ForwardMessageDialog")
            ForwardMessageDialog.show(messageId);
            
        });
        

        $('.btn-unlike').unbind().on('click',function(e){
            
            e.preventDefault();
            self.preventLastClick = true;
            
            var messageId = $(this).attr('messageid');
            
            removeFromFavoriteClient.send(messageId,function(data){
                
                $("[id=" +  messageId + "]").fadeOut();
                
            },function(errorCode){
                console.log(errorCode);
                UIUtils.handleAPIErrors(errorCode);
            });
            
        });
        
    },

    startChat: function(messageId){
        
        var messageObj = _.find(this.dataList,function(row){
            return row.messageModel._id == messageId
        }).messageModel;
        
        if(messageObj.room){

            ChatManager.openChatByRoom(messageObj.room,messageId);

        }else if(messageObj.group){

            ChatManager.openChatByGroup(messageObj.group,messageId);

        }else {

            ChatManager.openChatByPrivateRoomId(messageObj.roomID,messageId);

        }

    }
    
});

module.exports = FavoriteView;
