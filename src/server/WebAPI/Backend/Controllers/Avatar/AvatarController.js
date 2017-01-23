/**  Called for /api/v2/avatar/user/:thubmailid API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');
var fs = require('fs');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var Utils = require( pathTop + 'lib/utils');
var UserModel = require( pathTop + 'Models/User');
var OrganizationModel = require( pathTop + 'Models/Organization');
var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var UserAvatarController = function(){
}

_.extend(UserAvatarController.prototype,BackendBase.prototype);

UserAvatarController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v2/avatar/user/:fileID UserAvatar
     * @apiName User Avatar
     * @apiGroup WebAPI
     * @apiDescription Returns image of user avatar
**/

    router.get('/user/',function(request,response){
        
        var filePath = Config.publicPath + "/images/usernoavatar.png";
        response.sendFile(filePath);               

    });
    
    router.get('/user/:fileID',function(request,response){
        
        var fileID = request.params.fileID;
        var filePath = Config.uploadPath + "/" + fileID;

        fs.exists(filePath, function (exists) {
            
            if(!exists){
                
                filePath = Config.publicPath + "/images/usernoavatar.png";
                response.sendFile(filePath);
                
            } else {
                
                response.sendFile(filePath);
                
            }
            
        });

    });


   /**
     * @api {get} /api/v2/avatar/group/:fileID GroupAvatar
     * @apiName Group Avatar
     * @apiGroup WebAPI
     * @apiDescription Returns image of group avatar
**/

    router.get('/group/',function(request,response){
        
        var filePath = Config.publicPath + "/images/groupnoavatar.png";
        response.sendFile(filePath);               

    });
    
    router.get('/group/:fileID',function(request,response){
        
        var fileID = request.params.fileID;
        var filePath = Config.uploadPath + "/" + fileID;

        fs.exists(filePath, function (exists) {
            
            if(!exists){
                
                filePath = Config.publicPath + "/images/groupnoavatar.png";
                response.sendFile(filePath);
                
            } else {
                
                response.sendFile(filePath);
                
            }
            
        });

    });

   /**
     * @api {get} /api/v2/avatar/room/:fileID RoomAvatar
     * @apiName Room Avatar
     * @apiGroup WebAPI
     * @apiDescription Returns image of room avatar
**/

    router.get('/room/',function(request,response){
        
        var filePath = Config.publicPath + "/images/groupnoavatar.png";
        response.sendFile(filePath);               

    });
    
    router.get('/room/:fileID',function(request,response){
        
        var fileID = request.params.fileID;
        var filePath = Config.uploadPath + "/" + fileID;

        fs.exists(filePath, function (exists) {
            
            if(!exists){
                
                filePath = Config.publicPath + "/images/groupnoavatar.png";
                response.sendFile(filePath);
                
            } else {
                
                response.sendFile(filePath);
                
            }
            
        });

    });
    

    return router;

}

module["exports"] = new UserAvatarController();
