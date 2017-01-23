/** Called for /api/v2/sticker/:stickerId API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');
var fs = require('fs');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var LocalizationManager = require( pathTop + 'lib/LocalizationManager');
var Utils = require( pathTop + 'lib/utils');
var GroupModel = require( pathTop + 'Models/Group');
var UserModel = require( pathTop + 'Models/User');
var StickerModel = require( pathTop + 'Models/Sticker');
var OrganizationModel = require( pathTop + 'Models/Organization');
var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var StickersController = function(){
}

_.extend(StickersController.prototype,BackendBase.prototype);

StickersController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v2/sticker/:fileID ShowSticker
     * @apiName ShowSticker
     * @apiGroup WebAPI
     * @apiDescription Returns image of the sticker

**/
    
    router.get('/',function(request,response){

        if(!request.header('Referer')){
            
            self.errorResponse(
                response,
                Const.httpCodeSucceed,
                Const.responsecodeParamError,
                self.l10n("Download Failed"),
                false
            );
            
            return;
        }
        
        var filePath = Config.publicPath + "/images/nosticker.png";
        response.type('png');
        response.sendFile(filePath);               

    });
    
    router.get('/:fileID',function(request,response){

        if(!request.header('Referer')){
            
            self.errorResponse(
                response,
                Const.httpCodeSucceed,
                Const.responsecodeParamError,
                self.l10n("Download Failed"),
                false
            );
            
            return;
        }
        
        var fileID = request.params.fileID;
        var filePath = Config.uploadPath + "/" + fileID;

        fs.exists(filePath, function (exists) {
            
            if(!exists){
                
                filePath = Config.publicPath + "/images/nosticker.png";
                response.type('png');
                response.sendFile(filePath);
                
            } else {

                response.sendFile(filePath);
                
            }
            
        });

    });
   
    return router;

}

module["exports"] = new StickersController();
