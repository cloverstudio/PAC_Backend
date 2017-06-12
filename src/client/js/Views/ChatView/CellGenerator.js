var Backbone = require('backbone');
var _ = require('lodash');
var VCardParser = require('oniyi-vcard-parser');

var Utils = require('../../lib/utils');
var Const = require('../../lib/consts');
var Config = require('../../lib/init');

var encryptionManager = require('../../lib/EncryptionManager');
var loginUserManager = require('../../lib/loginUserManager');

console.log('VCardParser',VCardParser);

function CellGenerator(){
    
    // loading templates
    this.messageTemplate = require('./MessageCells/Message.hbs');
    
    this.fileUploadingTemplate = require('./MessageCells/FileUploading.hbs');
    //this.userStateChangeTemplate = require('./MessageCells/UserStateChange.hbs');
    this.fileTemplate = require('./MessageCells/File.hbs');
    this.thumbTemplate = require('./MessageCells/Thumbnail.hbs');
    //this.typingTemplate = require('./MessageCells/Typing.hbs');
    this.deletedTemplate = require('./MessageCells/DeletedMessage.hbs');
    this.locationTemplate = require('./MessageCells/Location.hbs');
    this.contactTemplate = require('./MessageCells/Contact.hbs');
    this.stickerTemplate = require('./MessageCells/Sticker.hbs');
};

CellGenerator.prototype.parentView = null;
CellGenerator.prototype.generate = function(messageModel){

    var flatData = {};

    _.forEach(messageModel, function(val, key) {
        flatData[key] = val;
    });

    _.forEach(messageModel.user, function(val, key) {
    
        if(key == 'created')
            return;
            
        if(key == '_id')
            return;
            
        flatData[key] = val;
    });

    // change this 
    flatData.avatarURL = "";

    if(messageModel.type == Const.messageTypeText){

        flatData.message = encryptionManager.decryptText(flatData.message);

        flatData.message = Utils.escapeHtml(flatData.message);
        flatData.message = flatData.message.replace(new RegExp('  ','g'), '&nbsp;&nbsp;');
        flatData.message = flatData.message.replace(new RegExp('\t','g'), '&nbsp;&nbsp;&nbsp;&nbsp;');
        flatData.message = flatData.message.replace(new RegExp('\r?\n','g'), '<br/>');
        flatData.message = Utils.contentExtract(flatData.message);
    }
    
    //if(flatData.userID == loginUserManager.getUser()['_id']){
    //    flatData.isMine = 'mine';
    //    flatData.isMainForIf = 1;
    //}else{
        flatData.isMine = 'other';
    //}
    
    var html = '';
    
    if(messageModel.deleted && messageModel.deleted != 0){

        html = this.deletedTemplate(flatData);
        
    } else {
        
        if(messageModel.type == Const.messageTypeText)
            html = this.messageTemplate(flatData);
        

        if(messageModel.type == Const.messageTypeFile && flatData.file && flatData.file.file){
                    
            if(flatData.file && flatData.file.thumb && flatData.file.file){
                
                // thumbnail exists
                //flatData.downloadURL = 'http://192.168.1.5:8080/img/ipad-art-wide-AVATAR2-420x0.jpg';
                flatData.downloadURL = "/api/v2/file/" + flatData.file.file.id;
                flatData.thumbURL = "/api/v2/file/" + flatData.file.thumb.id;
                html = this.thumbTemplate(flatData);
                                     
            }else{
    
                flatData.file.file.size = Math.floor(flatData.file.file.size / 1024 / 1024 * 100) / 100; // MB
                flatData.downloadURL = "/api/v2/file/" + flatData.file.file.id;
                
                html = this.fileTemplate(flatData);
                
            }
            
        }

        if(messageModel.type == Const.messageTypeSticker){
            html = this.stickerTemplate(flatData);
        }
        

        if(messageModel.type == Const.messageFileUploading){
            
            if(messageModel.isUploading == 1){
                html = this.fileUploadingTemplate(flatData);                
            }
            
        }
    

        
        if(messageModel.type == Const.messageTypeLocation){
            html = this.locationTemplate(flatData);
        }
        
        if(messageModel.type == Const.messageTypeContact){

            var vcard = new VCardParser({
                vCardToJSONAttributeMapping: {
                    'FN': 'name',
                    'TEL;HOME': 'telhome',
                    'TEL;CELL': 'telcell'
                }
            });

            var vcardObject = vcard.toObject(flatData.message);
            
            flatData.vcard = vcardObject;
            html = this.contactTemplate(flatData);
        }
        
        /*

        if(messageModel.get('type') == CONST.MESSAGE_TYPE_STICKER){
            html = this.stickerTemplate(flatData);
        }

        if(messageModel.get('type') == CONST.MESSAGE_TYPE_TYPING){
            
            flatData.message = flatData.name + " is typing...";
            html = this.typingTemplate(flatData);
    
        }
            
        if(messageModel.get('type') == CONST.MESSAGE_TYPE_NEW_USER){
            
            flatData.message = flatData.name + " joined to conversation. ";
            html = this.userStateChangeTemplate(flatData);
    
        }
    
        if(messageModel.get('type') == CONST.MESSAGE_TYPE_USER_LEAVE){
            
            flatData.message = flatData.name + " left from conversation. ";
            html = this.userStateChangeTemplate(flatData);
    
        }
        */

        
    }

    return html;

};


module.exports = CellGenerator;


    