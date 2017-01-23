/** Handles file send webhook */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var mime = require('mime');

var pathTop = "../../../../../../";

var Const = require(pathTop +"lib/consts");
var Config = require(pathTop +"lib/init");
var Utils = require(pathTop +'lib/utils');
var SpikaSaveFileLogic = require( pathTop + '../../modules_customised/spika/src/server/Logics/SaveFile');

var FileAdapter = function(request){
    this.request = request;
}

FileAdapter.prototype.createMessage = function(callBack){

    var params = this.request.body;
    
    var name = "Bot";
    var message = "WebHook";
    var avatar = "http://www.spika.chat/images/avtar_robot.png";
    var identifier = "0001";
    
    if(params.name)
        name = params.name;
        
    if(params.message)
        message = params.message;

    if(params.avatarURL)
        avatar = params.avatarURL;

    if(params.identifier)
        identifier = params.identifier; 
    
    if(params.file && params.file.content){

        var bitmap = new Buffer(params.file.content, 'base64');
        var destPath = Config.uploadPath + "/";
        var newFileName = Utils.getRandomString(32);  
        var savePath = destPath + newFileName;
        
        // save to file system first
        fs.writeFileSync(savePath, bitmap);

        // read file 
        var mimeType = mime.lookup(savePath); 

        var stats = fs.statSync(savePath)
        var fileSizeInBytes = stats["size"]

        var file = {
            path:savePath,
            name:params.file.name,
            size:fileSizeInBytes,
            type:mimeType
        }

        if(params.file.type){
            file.type = params.file.type;
        }

        SpikaSaveFileLogic.execute(file,function(err,logicResult){

            var message = {
                name: name,
                message : message,
                type : 1,
                avatarURL : avatar,
                serviceIdentifier: identifier
            };
            
            if(logicResult.file && logicResult.fileModel){

                message.file = {

                    file:{
                        name: logicResult.file.name,
                        mimeType : logicResult.file.type,
                        size : logicResult.file.size,
                        id: logicResult.fileModel._id.toString()
                    }

                }

                if(logicResult.thumbModel){
                    var thumbObj = logicResult.thumbModel.toObject();

                    message.file.thumb = {
                        name: thumbObj.name,
                        mimeType : thumbObj.type,
                        size : thumbObj.size,
                        id: thumbObj._id
                    };
                }
                message.type = 2;

            }

            callBack(message);

        });

    } else {

        var message = {
            name: name,
            message : message,
            type : 1,
            avatarURL : avatar,
            serviceIdentifier: identifier
        };

        callBack(message);
    }

}

module["exports"] = FileAdapter;
