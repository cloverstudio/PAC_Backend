var Backbone = require('backbone');
var _ = require('lodash');

var Utils = require('../../../lib/utils');
var Const = require('../../../lib/consts');
var Config = require('../../../lib/init');

var SideMenu = require('../../SideMenu/SideMenu');

var template = require('../ChatView.hbs');

var loginUserManager = require('../../../lib/loginUserManager');
var encryptionManager = require('../../../lib/EncryptionManager');
var socketIOManager = require('../../../lib/SocketIOManager');
var ChatManager = require('../../../lib/ChatManager');

var StickerListClient = require('../../../lib/APIClients/StickerListClient');

var template = require('./StickerPanel.hbs');
var templateContents = require('./StickerContent.hbs');

var EmoticonPanelView = Backbone.View.extend({

    el : null,
    currentMessage:null,
    dataList : [],
    callBack : null,
    ignoreClose : false,
    initialize: function(options,callBack) {
    
    	if($("#sticker-panel")[0])
    		return;
    		
		this.callBack = callBack;
        this.el = options.el;
        this.render();

    }, 

    render: function() {
        
        $(this.el).append(template());
        
        this.onLoad();
        
        return this;

    },

    onLoad: function(){
        
        var self = this;

        StickerListClient.send(loginUserManager.user.organizationId,function(data){

            Backbone.on(Const.NotificationGlobalClick ,function(){
                
                if(self.ignoreClose){
                    
                    _.debounce(function(){
                        self.ignoreClose = false;
                    },100)();
                    
                    return;
                }
                    
                self.hide();
                        
            });
            
            self.dataList = data.stickers;

            $('#sticker-panel').html(templateContents({
                list:data.stickers
            }));
    
            self.afterRender();
            
        },function(){

        });

        
    },
    hide:function(){

	    $("#sticker-panel").remove();
	    Backbone.off(Const.NotificationGlobalClick );
	    
	    if(this.callBack)
	    	this.callBack(null);
            
    },
    
    afterRender: function(){
	    
        var self = this;
        
	    var tabWidth = $('#sticker-tabs li.tabs').outerWidth();
	    var totalWidth = tabWidth * this.dataList.length;
	    
	    $('#sticker-tabs').width(totalWidth);
	    $('#sticker-picture-container ul').css('display','none');
	    $('#sticker-picture-container #pictures-0').css('display','block');
	    $('#sticker-tabs #tab-0').addClass('selected');
        
        $('#sticker-tabs .tabs').unbind().on('click',function(){
            
            self.ignoreClose = true;
            var listNumber = $(this).attr('key');
            
            $('#sticker-tabs .tabs').removeClass('selected');
            $(this).addClass('selected');
            
            $('#sticker-picture-container ul').css('display','none');
            $('#sticker-picture-container #pictures-' + listNumber).css('display','block');
            
        });

        $('#sticker-tabs-prev').unbind().on('click',function(){
            
            self.ignoreClose = true;
            
            var scroll = $('#sticker-tabs-parent').scrollLeft();
            var width = $('#sticker-tabs-parent').outerWidth();
            
            $('#sticker-tabs-parent').scrollLeft(scroll - width);
            
            
        });
 
        $('#sticker-tabs-next').unbind().on('click',function(){
            
            self.ignoreClose = true;
            
            var scroll = $('#sticker-tabs-parent').scrollLeft();
            var width = $('#sticker-tabs-parent').outerWidth();
            
            $('#sticker-tabs-parent').scrollLeft(scroll + width);
            
        });
        
        $('#sticker-picture-container .picture').unbind().on('click',function(){
            
            self.ignoreClose = true;
            self.sendMessage($(this).attr('url'));
            
        });
        
        
    },
    
    sendMessage: function(url){
        
        this.hide();
        
        socketIOManager.emit('sendMessage',{
            message: url,
            roomID: loginUserManager.currentConversation,
            userID: loginUserManager.user._id,
            type:Const.messageTypeSticker,
            localID: '_' + Utils.getRandomString(),
            attributes:{
                useclient: "web"
            }
        });
            
    }
    
});

module.exports = EmoticonPanelView;
