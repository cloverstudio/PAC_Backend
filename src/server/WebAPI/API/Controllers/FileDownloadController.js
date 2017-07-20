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

var FileDownloadController = function(){
}

_.extend(FileDownloadController.prototype,APIBase.prototype);

FileDownloadController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v3/file/download/fileid download file
     **/

    router.get('/:fileId',checkAPIKey,function(request,response){

        var fileId = request.params.fileId;
        var filePath = Config.uploadPath + "/" + fileId;

        var fileModel = FileModel.get();

        async.waterfall([

            (done) => {

                fileModel.findOne({
                    _id:fileId
                },function(err,findResult){

                    done(err,{
                        fileModel:findResult
                    })
                });

            },
            (result,done) => {

                fs.exists(filePath, function (exists) {
                    
                    if(!exists){
                        
                        done("file not found",result);

                        
                        
                    } else {
                        
                        result.filePath = filePath;
                        done(null,result);
                        
                        
                    }
                    
                });

            },

        ],(err, result) => {

            if(err){
                response.send('File Not Found', 404);
                return;
            }

            response.download(filePath,result.fileModel.name);

        });

    });

    return router;
}

module["exports"] = new FileDownloadController();
