var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');
var jschardet = require('jschardet');
var Iconv = require('iconv').Iconv;

var RequestHandlerBase = require("./RequestHandlerBase");
var UsersManager = require("../lib/UsersManager");
var DatabaseManager = require("../lib/DatabaseManager");
var Utils = require("../lib/Utils");
var Const = require("../const");
var async = require('async');
var formidable = require('formidable');
var fs = require('fs-extra');
var path = require('path');
var mime = require('mime');
var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');
var Settings = require("../lib/Settings");

var SaveFileLogic = require("../Logics/SaveFile");

var FileUploadHandler = function(){
    
}

_.extend(FileUploadHandler.prototype,RequestHandlerBase.prototype);

FileUploadHandler.prototype.attach = function(router){
        
    var self = this;
    
    /**
     * @api {post} /file/upload  Upload File 
     * @apiName Upload File
     * @apiGroup WebAPI
     * @apiDescription Upload file and get file id by response

     * @apiParam {File} file urlencoded multy part field name
     *
     * @apiSuccess {String} Token
     * @apiSuccess {String} User Model of loginned user
     *     
     * @apiSuccessExample Success-Response:
        {
            "code": 1,
            "data": {
                "file": {
                    "id": "55cdeba8a2d0956d24b421df",
                    "name": "Procijena.xlsx",
                    "size": 493966,
                    "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }
            }
        }
    */
    router.post('',function(request,response){
        
        var form = new formidable.IncomingForm();
        form.maxFieldsSize = 2 * 1024 * 1024;
        //console.log('filupload',1);

        async.waterfall([
            
            function (done) {
                
                //console.log('filupload',2);

                fs.exists(Settings.options.uploadDir, function (exists) {
                    
                    //console.log('filupload',3);

                    if(exists){
                        
                        /* works only node > 0.12
                        fs.access(Config.uploadDir, fs.R_OK | fs.W_OK, function(err) {
                            
                            if(err){

                                console.log('Please check permission of upload dir');
                                done("Upload dir doesnt has permission",{});
                                
                            }else {

                                done(null,{});
                                                                
                            }
                        }); 
                        */
                        
                        //console.log('filupload',4);

                        done(null,{});
                        
                    } else {

                        console.log('Please check path of upload dir');                        
                        done("Upload dir doesnt exist",{});
                        
                    }
                    
                });        
                        
            },
            function (result,done) {
                
                //console.log('filupload',5);

                form.parse(request, function(err, fields, files) {
            
                    //console.log('filupload',6);
                    
                    if(!files.file){
                        
                        //console.log('filupload',7);

                        self.successResponse(response,Const.resCodeFileUploadNoFile);
                        return; 
                        
                    }else{
                        
                        //console.log('filupload',8);

                        var tempPath = files.file.path;
                        var fileName = files.file.name;
                
                        var destPath = Settings.options.uploadDir;
                        
                        done(err,files.file);

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
            
            function (file,done){

                console.log('filupload',9);

                SaveFileLogic.execute(file,function(err,logicResult){

                    console.log('filupload',10);

                    done(err,logicResult);
    
                });

            }
            
        ],
            function (err, result) {
                
                console.log('filupload',11);

                if(err){

                    console.log('filupload',12);

                    self.errorResponse(
                        response,
                        Const.httpCodeSeverError
                    );
                
                }else{

                    console.log('filupload',13);

                    var responseJson = {
                        file:{
    		                id: result.fileModel.id,
        		            name: result.file.name,
        		            size: result.file.size,
        		            mimeType: result.file.type
                        }
                    };
                    
                    console.log('filupload',14);

                    if(!_.isUndefined(result.thumbModel)){

                        console.log('filupload',15);

                        responseJson.thumb = {
    		                id: result.thumbModel.id,
        		            name: result.thumbModel.name,
        		            size: result.thumbModel.size,
        		            mimeType: result.thumbModel.mimeType
                        };
                    }
                    
                    console.log('filupload',16);

                    self.successResponse(response,Const.responsecodeSucceed,
                        responseJson);
                }
                     
            }
        );
        
    });

}
new FileUploadHandler().attach(router);
module["exports"] = router;
