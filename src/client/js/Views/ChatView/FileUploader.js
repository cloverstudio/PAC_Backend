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

var FileUploadClient = require('../../lib/APIClients/Messaging/FileUploadClient');

function FileUploader(options){

    this.parentView = options.view;

};

FileUploader.prototype.parentView = null;
FileUploader.prototype.tempID = null;

FileUploader.prototype.handleClick = function(){
    
    $('#file-input').click();

}

// receives event object for change event for file input
FileUploader.prototype.startUploadingFile = function(event){

    files = event.target.files;
    if(files.length > 0){
        this.uploadFileHTML5(files[0]);
    }

};

FileUploader.prototype.uploadFileHTML5 = function(file){

    this.tempID = '_' + Utils.getRandomString();
    var self = this;
    
    // insert file upload message
    var message = {
                
        _id: this.tempID ,
        localID: this.tempID ,
        userID: loginUserManager.user._id,
        message: 'file uploading 0%',
        type: Const.messageFileUploading,
        created: Utils.now(),
        user: loginUserManager.user
        
    };

    if ('name' in file) {
        message.filename = file.name;
    }
    else {
        message.filename = file.fileName;
    }

    if ('size' in file) {
        message.size = Math.floor(file.size / 1024 / 1024 * 100) / 100; // MB
    }
    else {
        message.size = Math.floor(file.size / 1024 / 1024 * 100) / 100; // MB
    }
                   
    message.uploadProgress = 0;
    message.isUploading = 1;
    
    this.parentView.insertTempMessage(message);
    
    this.parentView.scrollToBottom();
    

    FileUploadClient.send(file,
        function(progress){
            
            message.uploadProgress = Math.floor(progress * 100);
            self.parentView.updateTempMessage(message);

        },
        function(result){
            
            // Emit data to server
            socketIOManager.emit('sendMessage',{
                roomID: self.parentView.currentRoomId,
                userID: loginUserManager.user._id,
                type: Const.messageTypeFile,
                localID: self.tempID,
                attributes:{
                    useclient: "web"
                },
                file:{
                    file:result.file,
                    thumb:result.thumb
                },
                user: loginUserManager.user
            });

        },
        function(err){

        }
    )

    /*
    WebAPIManager.fileUpload(
        
        UrlGenerator.uploadFile(), 
        
        file,

        // progress
        function(progress){
            
            message.set('uploadProgress',Math.floor(progress * 100));
            self.parentView.updateMessage(message);
            
        },
                    
        // success
        function(data){
            
            socketIOManager.emit('sendMessage',{
                message: '',
                roomID: LoginUserManager.roomID,
                userID: LoginUserManager.user.get('id'),
                file:data,
                type:CONST.MESSAGE_TYPE_FILE,
                localID: tempID
            });
                            
        },
        
        //error
        function(error){
            
        }
        
    );
    */

}


module.exports = FileUploader;


    