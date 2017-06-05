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

var stickerPanelView = require('./StickerPanel/StickerPanelView');

var RenderDirection = {
    append:'new',
    prepend:'old',
    allto: "allto"
};

var ChatView = Backbone.View.extend({
    
    container : "",
    views : [],
    currentRoomId: '',
    lastMessageId: 0,
    firstMessageId: 0,
    autoLoadMessageId: 0,
    loadedMessages: [],
    initialTBHeight : 0,
    initialTBContainerHeight : 0,
    fileUploader: null,
    messagePool: [],
    lastTextLength: 0,
    initialize: function(options) {
        
        this.container = options.container;
        this.currentRoomId = options.roomId;
        this.autoLoadMessageId = options.autoLoadMessageId;
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

        Backbone.on(Const.NotificationNewMessage, function(message){
            
            if(message.roomID == self.currentRoomId){

                self.renderMessages([message],RenderDirection.append);

                // prevent sending massive openMessage in same time to server
                _.delay(function() {

                    socketIOManager.emit('openMessage',{
                        messageID: message._id,
                        userID: loginUserManager.user._id,
                    });

                }, 1000 * Math.random(), 'later');

            }

        });

        Backbone.on(Const.NotificationMessageUpdated, function(messages){
            
            if(messages.length > 0 && messages[0].roomID == self.currentRoomId) {
                self.updateMessage(messages);
            }

        });

        Backbone.on(Const.NotificationTyping, function(param){
            self.updateTyping(param);
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
        
        $('#btn-emoticons').on('click',function(){

            var view = new stickerPanelView({
                'el': "#main-container"
            },function(selectedSticker){
	            
	            if(selectedSticker){
		            
	            }
	            
	            view = null;
	            
            });

        });

        var counter = 0;

        var da = document.getElementById('messages');

        da.addEventListener('dragover', function(e){
            e.preventDefault();  
        });

        da.addEventListener('dragenter', function(e){
            e.preventDefault();  
            counter++;
            $('#messages').addClass('drag');
            $('#file-drop-indicator').addClass('drag');

        });

        da.addEventListener('dragleave', function(e){
            e.preventDefault();  
            counter--;
            if (counter === 0) { 
                $('#messages').removeClass('drag');
                $('#file-drop-indicator').removeClass('drag');
            }
            
        });

        da.addEventListener('drop', function(e){

            e.preventDefault();  
            e.stopPropagation();
            
            counter = 0;
            
            $('#messages').removeClass('drag');
            $('#file-drop-indicator').removeClass('drag');
            
            if(e.dataTransfer){
                
                var dt = e.dataTransfer;
                if (dt.items) {
                    // Use DataTransferItemList interface to access the file(s)
                    for (var i=0; i < dt.items.length; i++) {

                        if (dt.items[i].kind == "file") {
                            var f = dt.items[i].getAsFile();

                            self.fileUplaoder.uploadFileHTML5(f);
                        }

                    }
                } else {

                    for (var i=0; i < dt.files.length; i++) {
                        var f = dt.files[i];
                        self.fileUplaoder.uploadFileHTML5(f);
                    }  
                }

            }
        });

        this.loadLatestMessage();

    },

    loadLatestMessage: function(){

        var self = this;

        var loadType = RenderDirection.append;

        console.log('this.autoLoadMessageId',this.autoLoadMessageId);

        if(this.autoLoadMessageId){
            this.firstMessageId = this.autoLoadMessageId;
            loadType = RenderDirection.allto;
        }

        LoadMessageClient.send(this.currentRoomId,this.firstMessageId,loadType,function(res){
            
            if(res.messages && res.messages.length > 0){

                if(self.lastMessageId == 0){
                    Backbone.trigger(Const.NotificationChatLoaded);
                }

                self.lastMessageId = res.messages[0]._id;
                self.firstMessageId = res.messages[res.messages.length - 1]._id;
                self.renderMessages(res.messages,RenderDirection.append);

                self.scrollToBottom();
                Backbone.trigger(Const.NotificationRefreshHistory);

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

            // merge message arry
            var isExist = _.find(self.messagePool,{'_id':message._id});
            if(!isExist)
                self.messagePool.push(message);
            else{
                self.messagePool = _.filter(self.messagePool,function(o){
                    return o._id != message._id
                });
                self.messagePool.push(message);
            }
            _.sortBy(self.messagePool,function(o){
                return o.created;
            });

            var avatarFileId = "";

            // get AvatarURL
            if(message.user && message.user.avatar && message.user.avatar.thumbnail){
                avatarFileId = message.user.avatar.thumbnail.nameOnServer;
            }

            message.avatarFileId = avatarFileId;
            
            var cellHtml = cellGenerator.generate(message);

            // check localId existed
            var localIdCell = $('[localid="' + message.localID + '"]')

            // check id existed
            var idCell = $('[id="' + message._id + '"]')

            if(localIdCell.length > 0 ){

                // swap temporary message
                $(cellHtml).insertAfter(localIdCell);
                localIdCell.remove();

            } else if(idCell.length > 0){

                // swap temporary message
                $(cellHtml).insertAfter(idCell);
                idCell.remove();

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

        $('.message-cell').css('cursor','pointer');
        $('.message-cell').unbind().on('click',function(){
            
            $('.message-cell.selected').removeClass('selected');
            $(this).addClass('selected');
            
            var cellElm = this;

            var message = _.find(self.messagePool,function(o){
                return o._id == $(cellElm).attr('id');
            });

            Backbone.trigger(Const.NotificationSelectMessage,{
                message: message
            });
    
        });

        Backbone.trigger(Const.NotificationUpdateWindowSize);

    },
    destroy: function(){
        
        _.forEach(this.views,function(view){
            
            if(view.destroy)
                view.destroy();
             
        });

        console.log('typing off');
        
        var param = {
            roomID: this.currentRoomId,
            userID: loginUserManager.user._id,
            type:Const.typingOff
        };

        socketIOManager.emit('sendtyping',param);

        Backbone.off(Const.NotificationNewMessage);
        Backbone.off(Const.NotificationMessageUpdated);
            
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
            
            if(self.lastTextLength == 0 && length > 0){

                var param = {
                    roomID: self.currentRoomId,
                    userID: loginUserManager.user._id,
                    userName: loginUserManager.user.name,
                    type:Const.typingOn
                };

                socketIOManager.emit('sendtyping',param);

            }
            
            if(self.lastTextLength > 0 && length == 0){

                var param = {
                    roomID: self.currentRoomId,
                    userID: loginUserManager.user._id,
                    type:Const.typingOff
                };

                socketIOManager.emit('sendtyping',param);
                
            }

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
    updateMessage:function(message){

        if(_.isArray(message))
            this.renderMessages(message,RenderDirection.append);
        else
            this.renderMessages([message],RenderDirection.append);

    },
    removeTyping: function(userID){

        var userIDEscapted = encodeURIComponent(userID).replace("'","quote").replace("%","");
        var emlContainer = SS('#additional-notification-container');
        
        SS('#' + userIDEscapted + "-typing").remove();

       if(_.isEmpty(emlContainer.html())){
            emlContainer.height(0);
            emlContainer.fadeOut();
            this.adjustSize();
        }
                        
    },
    addTyping: function(obj){
        
        var emlContainer = SS('#additional-notification-container');
        var userIDEscapted = encodeURIComponent(obj.userID).replace("'","quote").replace("%","");

        var text = obj.user.name + " is typing...";
        var id = userIDEscapted + "-typing";
        
        var html = '<span id="' + id + '">' + text + '</span>';

        if($('#' + id).length > 0)
            return;

        if(_.isEmpty(emlContainer.html())){

             emlContainer.height(20);
             emlContainer.fadeIn();
             this.adjustSize();

            if(this.isScrollNearBottom())
                this.scrollToBottom();  

        }
        
        if($('#' + id).length == 0)
            emlContainer.html( emlContainer.html() + html );

    },

    updateTyping: function(param){

        if(param.userID == loginUserManager.user._id)
            return;
            
        var emlContainer = $('#additional-notification-container');

        var text = param.userName + " is typing...";
        var id = param.userID + "-typing";

        if(param.type == Const.typingOn){

            if($('#' + id).length > 0)
                return;
                
            var html = '<span id="' + id + '">' + text + '</span>';
            
            if(_.isEmpty(emlContainer.html())){
                emlContainer.fadeIn();
            }
            
            emlContainer.html( emlContainer.html() + html );

        }

        if(param.type == Const.typingOff){

            if($('#' + id).length == 0)
                return;
            
            $('#' + id).remove();

            if(_.isEmpty(emlContainer.html())){
                emlContainer.fadeOut();
            }

        }

    }
});

module.exports = ChatView;
