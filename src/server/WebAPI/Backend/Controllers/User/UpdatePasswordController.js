/** Called for /api/v2/user/updatepassword API */

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

var BackendBase = require('../BackendBase');

var UpdatePasswordController = function(){}

_.extend(UpdatePasswordController.prototype,BackendBase.prototype);

   /**
     * @api {post} /api/v2/user/updatepassword Updaet Password
     * @apiName Updaet Password
     * @apiGroup WebAPI
     * @apiDescription Update password of request user
     * @apiHeader {String} access-token Users unique access-token.
     * @apiParam {string} currentPassword hashed current password
     * @apiParam {string} newPassword send raw string here

     * @apiSuccessExample Success-Response:
            {
                success: 1,
                data: {

                }
            }
    */
    
UpdatePasswordController.prototype.init = function(app){
        
    var self = this;

    router.post('/',tokenChecker,function(request,response){
        
        var userModel = UserModel.get();
        var currentPassword = request.body.currentPassword;
        var newPassword = request.body.newPassword;
        
        // check password
        if(request.user.password != currentPassword){
            self.successResponse(response,Const.responsecodeUpdatePasswordWrongCurrentPassword);
            return;
        }

        // check new password
        var errorCode = 0;
        
        if(!Const.REPassword.test(newPassword)){
        	errorCode = Const.responsecodeUpdatePasswordWrongNewPassword;
        	
        } 
        
        if(errorCode != 0){

            self.successResponse(response,errorCode);
            return;
            
        }
        
        var user = request.user;
        
        user.update({
            password: Utils.getHash(newPassword)
            
        },{},function(err,userResult){
            
            if(err){
                
                self.errorResponse(response,Const.httpCodeServerError);   
                                 
            }else {
            
                self.successResponse(response,Const.responsecodeSucceed);
                   
            }
        
        });
        
    });

    return router; 
}

module["exports"] = new UpdatePasswordController();
