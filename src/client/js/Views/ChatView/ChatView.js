var Backbone = require('backbone');
var _ = require('lodash');

var Utils = require('../../lib/utils');
var Const = require('../../lib/consts');
var Config = require('../../lib/init');

var SideMenu = require('../SideMenu/SideMenu');

var template = require('./ChatView.hbs');

var loginUserManager = require('../../lib/loginUserManager');
var encryptionManager = require('../../lib/EncryptionManager');
var socketIOManager = require('../../lib/SocketIOManager');
var ChatManager = require('../../lib/ChatManager');

var LoadMessageClient = require('../../lib/APIClients/Messaging/LoadMessageClient');
var CellGenerator = require('./CellGenerator');
var FileUplaoder = require('./FileUploader');

var RenderDirection = {
    append:'new',
    prepend:'old'
};

var ChatView = Backbone.View.extend({
    
    container : "",
    views : [],
    currentRoomId: '',
    lastMessageId: 0,
    firstMessageId: 0,
    loadedMessages: [],
    initialTBHeight : 0,
    initialTBContainerHeight : 0,
    fileUploader: null,
    initialize: function(options) {
        
        this.container = options.container;
        this.currentRoomId = options.roomId;
        this.render();

        this.fileUplaoder = new FileUplaoder({
            view: this
        });

    },

    render: function() {
        
        $(this.container).html(template({
            Config:Config
        }));
        
        this.onLoad();
        
        this.handleKeyEvents();

        return this;

    },

    onLoad: function(){
        
        var self = this;

        this.initialTBHeight = $( "#text-message-box" ).height();
        this.initialTBContainerHeight = $( "#text-message-box-container" ).height();

        Backbone.on(Const.NotificationNewMessage, function(param){
            
            self.loadLatestMessage();
            
        });

        var lastPosition = 0;
        $( "#messages" ).scroll(function() {
            var scrollPosition = $('#messages').scrollTop();

            // scrolling to up
            if(scrollPosition < lastPosition && scrollPosition == 0){
                self.loadNextMessage();
            }
            
            lastPosition = scrollPosition;
            
        });

        $('#btn-fileupload').on('click',function(){
            
            self.fileUplaoder.handleClick();
            
        });

        $('#file-input').on('change',function(event){
                        
            self.fileUplaoder.startUploadingFile(event);

        });
        

        this.loadLatestMessage();

    },

    loadLatestMessage: function(){

        var self = this;

        LoadMessageClient.send(this.currentRoomId,this.firstMessageId,RenderDirection.append,function(res){
            
            if(res.messages && res.messages.length > 0){

                self.lastMessageId = res.messages[0]._id;
                self.firstMessageId = res.messages[res.messages.length - 1]._id;
                self.renderMessages(res.messages,RenderDirection.append);

                self.scrollToBottom();

            }

        },function(){

        });

    },

    loadNextMessage: function(){

        var self = this;

        // keep scroll position
        var currentScrollPos = $('#messages')[0].scrollHeight

        LoadMessageClient.send(this.currentRoomId,this.lastMessageId,RenderDirection.prepend,function(res){

            if(res.messages && res.messages.length > 0){

                self.lastMessageId = res.messages[res.messages.length - 1]._id;
                self.renderMessages(res.messages,RenderDirection.prepend);
                var newScrollPos = $('#messages')[0].scrollHeight
                $('#messages').scrollTop(newScrollPos - currentScrollPos);

            }

        },function(){

        });

    },
    renderMessages: function(newMessages,renderDirection){

        var html = "";
        var cellGenerator = new CellGenerator();
        var self = this;

        newMessages.forEach(function(message){

            var avatarFileId = "";

            // get AvatarURL
            if(message.user && message.user.avatar && message.user.avatar.thumbnail){
                avatarFileId = message.user.avatar.thumbnail.nameOnServer;
            }

            message.avatarFileId = avatarFileId;
            
            var cellHtml = cellGenerator.generate(message);

            // check localId existed
            var localIdCell = $('[localid="' + message.localID + '"]')

            if(localIdCell.length > 0){

                // swap temporary message
                $(cellHtml).insertAfter(localIdCell);
                localIdCell.remove();

            } else {

                if(renderDirection == RenderDirection.append){

                    html += cellHtml;

                }

                if(renderDirection == RenderDirection.prepend){

                    html = cellHtml + html;

                }

            }

        });

        if(renderDirection == RenderDirection.append){

            $('#messages').append(html);

            $('img').on('load',function(){
                self.scrollToBottom();
            });

        }

        if(renderDirection == RenderDirection.prepend){

            $('#messages').prepend(html);

        }

        $('.spika-thumb').colorbox({photo:true,fixed:true,width:'80%',height:'80%%¥',
            onOpen:function(evt){



            }
        });

        Backbone.trigger(Const.NotificationUpdateWindowSize);

    },
    destroy: function(){
        
        _.forEach(this.views,function(view){
            
            if(view.destroy)
                view.destroy();
             
        });

        Backbone.off(Const.NotificationNewMessage);
        
    },
    handleKeyEvents: function(){
        
        var self = this;

        $( "#text-message-box" ).keypress(function(e) {
            
            var keycode = (e.keyCode ? e.keyCode : e.which);
            var shifted = e.shiftKey;

            if(keycode == 13){
                
                if(shifted){
                    
                    var currentHeight = $( "#text-message-box-container" ).height();
                    
                    if(currentHeight < 100){
                        $( "#text-message-box-container" ).height($( "#text-message-box-container" ).height() + self.initialTBHeight);
                        $( "#text-message-box" ).height($( "#text-message-box" ).height() + self.initialTBHeight);
                    }
                    
                }else{

                    // send
                    e.preventDefault();

                    $( "#text-message-box-container" ).height(self.initialTBContainerHeight);
                    $( "#text-message-box" ).height(self.initialTBHeight);

                    self.sendTextMessage(); 

                }
                
            }
                        
        });
        
        $( "#text-message-box" ).on('change keyup paste',function(){
            
            var length = $(this).val().length;
            
            /*
            if(self.lastTextLength == 0 && length > 0){
                socketIOManager.emit('sendTyping',{
                    roomID: loginUserManager.roomID,
                    userID: loginUserManager.user.get('id'),
                    type:CONST.TYPING_ON
                });
            }
            
            if(self.lastTextLength > 0 && length == 0){
                socketIOManager.emit('sendTyping',{
                    roomID: loginUserManager.roomID,
                    userID: loginUserManager.user.get('id'),
                    type:CONST.TYPING_OFF
                });
                
            }
            */
            self.lastTextLength = length;
 
        });

    },

    sendTextMessage: function(){
        
        var message = $( "#text-message-box" ).val();
        
        if(_.isEmpty(message))
            return;
            
        var tempID = '_' + Utils.getRandomString();
        
        // insert temp message
        var filteredMessage = encryptionManager.encryptText(message);

        var message = {
            _id: "temp",
            localID: tempID,
            userID: loginUserManager.user._id,
            message: filteredMessage,
            type: Const.messageTypeText,
            created: Utils.now(),
            user: loginUserManager.user
        };
        
        // insert temp message
        this.insertTempMessage(message);

        this.scrollToBottom();

        // Emit data to server
        socketIOManager.emit('sendMessage',{
            message: filteredMessage,
            roomID: this.currentRoomId,
            userID: loginUserManager.user._id,
            type: Const.messageTypeText,
            localID: tempID,
            attributes:{
                useclient: "web"
            },
            user: loginUserManager.user
        });

        // Clear message_area
        $('#message_area').val('');
        $( "#text-message-box" ).val('');
        
    },
    scrollToBottom: function(){
        $('#messages').scrollTop($('#messages')[0].scrollHeight);
    },
    insertTempMessage:function(message){

        this.renderMessages([message],RenderDirection.append);

    },
    updateTempMessage:function(message){

        this.renderMessages([message],RenderDirection.append);

    }

});

module.exports = ChatView;
