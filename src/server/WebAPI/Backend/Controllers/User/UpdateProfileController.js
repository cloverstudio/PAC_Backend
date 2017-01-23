/** Called for /api/v2/user/update API */

var express = require('express');
var router = express.Router();
var validator = require('validator');
var bodyParser = require("body-parser");
var _ = require('lodash');
var async = require('async');
var formidable = require('formidable');
var fs = require('fs-extra');
var easyimg = require('easyimage');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var Utils = require( pathTop + 'lib/utils');
var UserModel = require( pathTop + 'Models/User');
var tokenChecker = require( pathTop + 'lib/authApi');

var UpdateOrganizationDiskUsageLogic = require(pathTop + "Logics/UpdateOrganizationDiskUsage");

var BackendBase = require('../BackendBase');

var UpdateProfileController = function(){}

_.extend(UpdateProfileController.prototype,BackendBase.prototype);

UpdateProfileController.prototype.init = function(app){
        
    var self = this;


   /**
     * @api {post} /api/v2/user/update Update Profile
     * @apiName Update Profile
     * @apiGroup WebAPI
     * @apiDescription Update profile of request user
     * @apiHeader {String} access-token Users unique access-token.
     * @apiParam {string} name Name to display
     * @apiParam {string} description Description
     * @apiParam {file} file avatar file

     * @apiSuccessExample Success-Response:
{
	code: 1,
	time: 1455627869209,
	data: {
		user: {
			_id: '56c31e5c8402867d76843c7b',
			name: 'test',
			userid: 'userid13fXan',
			password: '*****',
			organizationId: '56c31e5c8402867d76843c7a',
			created: 1455627868973,
			status: 1,
			__v: 0,
			tokenGeneratedAt: 1455627869008,
			token: '*****',
			description: null,
			groups: [],
			thumbnail: {
				originalName: 'max.jpg',
				size: 64914,
				mimeType: 'image/png',
				nameOnServer: 'te0z9HsG9qOfxVwNawqS4CSnX1AovEMq'
			},
			picture: {
				originalName: 'max.jpg',
				size: 64914,
				mimeType: 'image/png',
				nameOnServer: 'P5AuA6bZ8qwdkf71cIWl32K4KmvMETyp'
			}
		}
	}
}
    */
    
    router.post('/',tokenChecker,function(request,response){
                        
        var form = new formidable.IncomingForm();
        
        async.waterfall([
            
            function (done) {
                
                form.parse(request, function(err, fields, files) {

                    // search user
                    done(err,{file:files.file,fields:fields});
                    
                });
                                
            },
                        
            function (result,done){
                
                // validate
                self.validate(result.fields,result.file,function(err){
                    
                    if(err){
                                                
                        self.successResponse(response,err);
                                                
                    } else {
                        
                        done(null,result);
                        
                    }
                    
                });
                                
            },
                        
            function (result,done){
                
                // save display name
                var user = request.user;
                
                user.update({
                    name: result.fields.name,
                    description: result.fields.description
                },{},function(err,userResult){
                    
                    if(err){
                        done(err,result);
                        return;
                    }
                                    
                    done(err,result);
                
                });
                
            },
            
            function (result,done){
                
                if(!result.file){
                    done(null,result);
                    return;
                }
                
                // save to upload dir
                var tempPath = result.file.path;
                var fileName = result.file.name;
                var destPath = Config.uploadPath + "/";
                
                var newFileName = Utils.getRandomString(32);                
                result.file.newFileName = newFileName;
                

                fs.copy(tempPath, destPath + newFileName, function(err) {

                    easyimg.convert({src: destPath + newFileName, dst: destPath + newFileName + ".png", quality:100}).then(function (file) {

                        fs.rename( destPath + newFileName + ".png", 
                             destPath + newFileName, function(err) {
                            
                            done(err,result);
                            
                        });
                                                        
                    });
                
                });
                    
            },
            function (result,done){

                if(!result.file){
                    done(null,result);
                    return;
                }
            
                var file = result.file;
                
                // generate thumbnail      
                if(file.type.indexOf("jpeg") > -1 ||
                    file.type.indexOf("gif") > -1 ||
                    file.type.indexOf("png") > -1){
                        
                        var thumbFileName = Utils.getRandomString(32); 
                        result.file.thumbName = thumbFileName;

                        var destPathTmp = Config.uploadPath + "/" + thumbFileName;

                        easyimg.thumbnail({
                                src: Config.uploadPath + "/" + result.file.newFileName, 
                                dst:destPathTmp + ".png",
                                width:Const.thumbSize, height:Const.thumbSize
                            }).then(
                            
                            function(image) {
                                
                                fs.rename(destPathTmp + ".png", 
                                    destPathTmp, function(err) {
                                    
                                    result.file.thumbSize = image.size;
                                    done(err,result);
                                    
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

                if(!result.file){
                    done(null,result);
                    return;
                }

                // save avatar name
                var user = request.user;
                
                user.update({
                    avatar:{
                        picture: { 
                            originalName: result.file.name, 
                            size: result.file.size, 
                            mimeType: "image/png",
                            nameOnServer: result.file.newFileName
                        },
                        thumbnail: { 
                            originalName: result.file.name, 
                            size: result.file.thumbSize, 
                            mimeType: "image/png",
                            nameOnServer: result.file.thumbName
                        }
                    }
                },{},function(err,userResult){
                    
                    if(err){
                        done(err,result);
                        return;
                    }
                	
                    done(err,result);
                
                });
                
            },
            function(result, done) {

                // update organization disk usage                
                if (result.file) {

                    var user = request.user;
                    var size = 0;

                    if (user.avatar.picture.size) {

                        var originalSize = user.avatar.picture.size + user.avatar.thumbnail.size;
                        var newSize = result.file.size + result.file.thumbSize;

                        size = newSize - originalSize;

                    } else {

                        size = result.file.size + result.file.thumbSize;

                    }

                    UpdateOrganizationDiskUsageLogic.update(user.organizationId, size, (err, updateResult) => {
                        done(err, result);
                    });
                    
                } else {

                    done(null, result);

                }

            },
            
            function (result,done){
	               
                var model = UserModel.get();
                 
                // get latest user info
                model.findOne(
                    {
                        _id: request.user._id, 
                    }, 
                function(err, findResult) {
                            
                    if(err){
                        done(err,result);
                        return;
                    }
                    
                    result.newUserData = findResult;
                    
                    done(err,result);
                     
                });
                
            }
            
        ],
            function (err, result) {
                
                if(err){
                    
                    self.errorResponse(response,Const.httpCodeServerError);   
                                     
                }else {
                
                    self.successResponse(response,Const.responsecodeSucceed,{
                        user: result.newUserData
                    });
                       
                }
                             
            }
            
        );
        
    });
	
    return router; 
}

UpdateProfileController.prototype.validate = function(fields,file,callBack){
    
    async.waterfall([
				
        function (done) {
            
            if(_.isEmpty(fields.name)){
            	done(Const.responsecodeUpdateProfileInvalidName);
            	return;
            }
            
            if(file){
                if(file.type.indexOf("jpeg") == -1 &&
                    file.type.indexOf("gif") == -1 &&
                    file.type.indexOf("png") == -1){
                    
                	done(Const.responsecodeUpdateProfileInvalidFile);
                	return;
                }                
            }

            
            done(null,null);

            
        }],
        
        function (err, result) {
            
            callBack(err);            
                         
        }
        
    );
    
}

module["exports"] = new UpdateProfileController();
