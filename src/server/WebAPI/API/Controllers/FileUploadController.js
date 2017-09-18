/**  Called for /api/v2/test API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');
var formidable = require('formidable');
var fs = require('fs-extra');
var easyImg = require('easyimage');
var path = require('path');

var pathTop = "../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var Utils = require( pathTop + "lib/utils");

var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var checkAPIKey = require( pathTop + 'lib/authApiV3');

var APIBase = require('./APIBase');

var FileModel = require( pathTop + 'Models/File');

var FileUploadController = function(){
}

_.extend(FileUploadController.prototype,APIBase.prototype);

FileUploadController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v3/file/upload upload file
     **/

    router.post('',checkAPIKey,function(request,response){
        
        var form = new formidable.IncomingForm();
        form.maxFieldsSize = 2 * 1024 * 1024;

        async.waterfall([
            
            function (done) {
                
                fs.exists(Config.uploadPath, function (exists) {
                    
                    if(exists){

                        done(null,{});
                        
                    } else {
                        
                        done({
                            status: 500,
                            message: "Server error"
                        },null);
                        
                    }
                    
                });        
                        
            },
            function (result,done) {
                
                form.parse(request, function(err, fields, files) {
                    
                    if(!files.file){

                        done({
                            status: 422,
                            message: "Bad parmeter"
                        },null);

                        return; 
                        
                    }else{

                        var tempPath = files.file.path;
                        var fileName = files.file.name;
                
                        var destPath = Config.uploadPath;
                        
                        result.file = files.file;

                        done(err,result);

                    }
                    
                });
                

                form.on('progress', function(bytesReceived, bytesExpected) {
                    //console.log('file progress',bytesReceived + " / " + bytesExpected);
                });

                form.on('field', function(name, value) {
                    //console.log('file field',name + " / " + value);
                });

                form.on('fileBegin', function(name, file) {
                    //console.log('file fileBegin',name + " / " + file);
                });

                form.on('file', function(name, file) {
                    //console.log('file',file);
                });

                form.on('error', function(err) {
                    //console.log('file error',err);
                });

                form.on('aborted', function() {
                    //console.log('file aborted');
                });

                form.on('end', function() {
                    //console.log('file end');
                });

            },
            
            function (result,done){

                // save to database
                var fileModel = FileModel.get();

                var tempPath = result.file.path;
                var fileName = result.file.name;

                // save to database
                var newFile = new fileModel({
                    name:fileName,
                    mimeType: result.file.type,
                    size: result.file.size,
                    created: Utils.now()                   
                });
                                                
                newFile.save(function(err,fileModel){

                    result.fileModel = fileModel;

                    done(err,result);
                
                });


            },

            function (result,done){

                var tempPath = result.file.path;
                var fileName = result.file.name;

                var destPath = Config.uploadPath;

                fs.copy(tempPath, destPath + "/" + result.fileModel._id, function(err) {
                
                    if (err){
                        
                        done(err,null);
                        
                    } else {
                                
                        done(err,result);
                        
                    }
                
                });
                
            },

            function (result,done){


                var file = result.file;
                             
                if(file.type.indexOf("jpeg") > -1 ||
                    file.type.indexOf("gif") > -1 ||
                    file.type.indexOf("png") > -1){
                    
                        var easyimg = require('easyimage');
                        var tempThumbFileName = result.fileModel.id + "_thumb.jpg"; // force to be jpg
                        var destPathTmp = Config.uploadPath + tempThumbFileName;
                        var fileName = result.file.name;

                        easyimg.thumbnail({
                                src: file.path, dst:destPathTmp,
                                width:256, height:256
                            }).then(
                            function(image) {
                                
                                var fileModel = FileModel.get();

                                // save to database
                                var thumbObj = new fileModel({
                                    name:"thumb_" + fileName,
                                    mimeType: "image/jpeg",
                                    size: image.size,
                                    created: Utils.now()                   
                                });
                                                             
                                thumbObj.save(function(err,thumbModel){

                                    var thumbFileName = thumbModel._id
                                    var destPath = Config.uploadPath + "/" + thumbFileName;
        
                                    // rename
                                    fs.rename(destPathTmp, destPath, function(){
                                    
                                        result.thumbModel = thumbModel;
                                        
                                        done(err,result);
                                    });

                                
                                });

                            },
                            function (err) {
                                // ignore thubmnail error
                                console.log(err);
                                done(null,result);
                            }
                        );
                    } else {
                        done(null,result);
                    }

            },

            function (result,done){

                done(null,result);

            },

            function (result,done){

                done(null,result);

            },

            
        ],
            function (err, result) {

                if(err){    

                    if(err.status && err.message)
                        response.status(err.status).send(err.message);
                    else
                        response.status(500).send("Server Error");

                    return;
                }
                
                var responseData = {
                    "file": {
                        "size": result.fileModel.size,
                        "fileId": result.fileModel._id,
                        "mimeType": result.fileModel.mimeType
                    }
                }

                if(result.thumbModel){

                    responseData.thumbnail = {
                        "size": result.thumbModel.size,
                        "fileId": result.thumbModel._id,
                        "mimeType": result.thumbModel.mimeType
                    }

                }

                self.successResponse(response,Const.responsecodeSucceed,responseData);
                     
            }
        );

    });

    return router;
}

module["exports"] = new FileUploadController();
