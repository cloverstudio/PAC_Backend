/** Called for /api/v2/message/favorite/add API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');


var Utils = require( pathTop + 'lib/utils');
var FavoriteModel = require( pathTop + 'Models/Favorite');
var OrganizationModel = require( pathTop + 'Models/Organization');
var MessageModel = require( pathTop + 'Models/Message');

var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var AddToFavoriteController = function(){
}

_.extend(AddToFavoriteController.prototype,BackendBase.prototype);

AddToFavoriteController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v2/message/favorite/add AddToFavorite
     * @apiName AddToFavorite
     * @apiGroup WebAPI
     * @apiDescription Add to callers favorite
     * @apiHeader {String} access-token Users unique access-token.
     * @apiParam {string} messageId messageId
     * @apiSuccessExample Success-Response:
{
	"code": 1,
	"time": 1457363319718,
	"data": {
		"favorite": {
			"__v": 0,
			"userId": "56c32acd331dd81f8134f200",
			"messageId": "56dd9527f3e5890d4700b9e6",
			"created": 1457363319710,
			"_id": "56dd9977ee7b28114fa651e6"
		}
	}
}

**/
    
    router.post('/',tokenChecker,function(request,response){
        
        var favoriteModel = FavoriteModel.get();
        var messageModel = MessageModel.get();
        
        var messageId = request.body.messageId;
        
        if(!messageId){
            self.successResponse(response,Const.responsecodeAddToFavoriteNoMessageId);
            return;
        }
        
        async.waterfall([function(done){
            
            var result = {};
            
            // check existance
            messageModel.findOne({
                _id : messageId
            },function(err,findResult){
                
                if(!findResult){
                    self.successResponse(response,Const.responsecodeAddToFavoriteInvalidMessageId);
                    return;
                }
                
                done(err,result)
                
            });
            
            
        },
        function(result,done){

            // check dublication
            favoriteModel.findOne({
                userId : request.user._id,
                messageId : messageId
            },function(err,findResult){
                
                if(findResult){
                    self.successResponse(response,Const.responsecodeAddToFavoriteExistedMessageId);
                    return;
                }
                
                done(err,result)
                
            });
            
        },
        function(result,done){
            
            // add to favorite
            var model = new favoriteModel({
                userId : request.user._id,
                messageId : messageId,
                created : Utils.now()
            });
            
            model.save(function(err,saveResult){
                
                result.favorite = saveResult;
                done(err,result);
                
            });
            
        },
        function(result,done){
            done(null,result)
        }
        ],
        function(err,result){
            
            if(err){
                console.log("critical err",err);
                self.errorResponse(response,Const.httpCodeServerError);
                return;
            }
            
            self.successResponse(response,Const.responsecodeSucceed,{
                favorite : result.favorite
            });
            
        });
        
    });
   
    return router;

}

module["exports"] = new AddToFavoriteController();
