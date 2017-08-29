/**  Called for /api/v2/test API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');
var formidable = require('formidable');
var fs = require('fs');
var easyImg = require('easyimage');
var path = require('path');

var pathTop = "../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var Utils = require( pathTop + 'lib/utils');
var UserModel = require( pathTop + 'Models/User');
var GroupModel = require( pathTop + 'Models/Group');
var OrganizationModel = require( pathTop + 'Models/Organization');

var BackendBase = require('./BackendBase');

var TestController = function(){
}

_.extend(TestController.prototype,BackendBase.prototype);

TestController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v2/test just test
     * @apiName just test
     * @apiGroup WebAPI
     * @apiDescription Returns text "test"
     **/

    router.get('',function(request,response){

        self.successResponse(response,Const.responsecodeSucceed,"test");

    });

    router.get('/aaaa',function(request,response){

        self.successResponse(response,Const.responsecodeSucceed,"test");

    });
    
    if(Config.isTest){
        
        router.post('/createtempuser',function(request,response){
            
            var model = UserModel.get();
            var body = request.body;
            
            var user = new model({
                
                name: body.name,
                userid: body.userid,
                password: body.password,
                organizationId : body.organizationId,
                created: Utils.now(),
                status: 1,
                permission: body.permission
                    
            });
            
            user.save(function(err,saveResult){
                
                self.successResponse(response,Const.responsecodeSucceed,{
                    user : saveResult.toObject()
                });
                
            });

        });

        router.post('/createtempgroup', function(request, response) {
            
            var model = GroupModel.get();
            var uploadPathError = self.checkUploadPath();

            async.waterfall([
                
                function(done) {
                
                    var form = new formidable.IncomingForm();
                    form.uploadDir = Config.uploadPath;

                    form.on('fileBegin', function(name, file) {

                        file.path = path.dirname(file.path) + "/" + Utils.getRandomString();

                    });

                    form.onPart = function(part) {

                        if (part.filename) {

                            if (!uploadPathError) form.handlePart(part);

                        } else if (part.filename != "") { 

                            form.handlePart(part);

                        }

                    }

                    form.parse(request, function(err, fields, files) {

                        done(err, { file: files.file, fields: fields });

                    });

                },
                function(result, done) {

                    if (uploadPathError) {
                        done(uploadPathError, result);
                        return;
                    }

                    var file = result.file;
                    var fields = result.fields;

                    var sortName = _.isEmpty(fields.sortName) ? fields.name.toLowerCase() : fields.sortName;
                    var group = null;
                    
                    var data = {

                        name: fields.name,
                        sortName: sortName,
                        description: fields.description,
                        created: Utils.now(),
                        organizationId: fields.organizationId,
                        users: fields.users.split(',')

                    };

                    if (file) {

                        easyImg.thumbnail({
                            src: file.path,
                            dst: path.dirname(file.path) + "/" + Utils.getRandomString(),
                            width: Const.thumbSize,
                            height: Const.thumbSize
                        }).then(
                            function(thumbnail) {

                                data.avatar = {

                                    picture: {
                                        originalName: file.name,
                                        size: file.size,
                                        mimeType: file.type,
                                        nameOnServer: path.basename(file.path)
                                    },
                                    thumbnail: {
                                        originalName: file.name,
                                        size: thumbnail.size,
                                        mimeType: thumbnail.type,
                                        nameOnServer: thumbnail.name
                                    }

                                }

                                result.thumbnailPath = thumbnail.path;

                                group = new model(data);
                                // save to DB          
                                group.save(function(err, saveResult){

                                    result.saveResult = saveResult;
                                    done(err, result);
                                
                                });

                            },
                            function (err) {
                                done(err, result);
                            }
                        );

                    } else {

                        group = new model(data);
                        // save to DB          
                        group.save(function(err, saveResult){

                            result.saveResult = saveResult;
                            done(err, result);
                        
                        });

                    } 
                                
                }
            ],
            function(err, result) {
                
                if (err) {
                    
                    if (result.file) fs.unlink(result.file.path, function() {});
                    if (result.file) fs.unlink(result.thumbnailPath, function() {});

                    throw err;

                } else {

                    self.successResponse(response, Const.responsecodeSucceed, {
                        group : result.saveResult.toObject()
                    });
                }            
                        
            });
            
        });

        // need for unit test - disable this in production
        router.post('/createtemporg', function(request, response) {
            
            var model = OrganizationModel.get();
            var body = request.body;

            var org = new model({
                name: body.name,
                organizationId:body.name,
                created: Utils.now(),
                status: 1
            });
            
            org.save(function(err, saveResult) {

                self.successResponse(response, Const.responsecodeSucceed, {
                    org : saveResult.toObject()
                });
                
            });

        });
    }
    
    return router;

}

TestController.prototype.checkUploadPath = function() {

    try {    

        fs.accessSync(Config.uploadPath);

    } catch (err) {

        return err;

    }
    
}

module["exports"] = new TestController();
