/** Called for /api/v2/message/favorite/remove API */

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
var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var RemoveFromFavoriteController = function(){
}

_.extend(RemoveFromFavoriteController.prototype,BackendBase.prototype);

RemoveFromFavoriteController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v2/message/favorite/remove RemoveFromFavorite
     * @apiName RemoveFromFavorite
     * @apiGroup WebAPI
     * @apiDescription Remove from favorite
     * @apiHeader {String} access-token Users unique access-token.
     * @apiParam {string} messageId messageId
     * @apiSuccessExample Success-Response:
{
	"code": 1,
	"time": 1457363319718
}

**/
    
    
    router.post('/',tokenChecker,function(request,response){

        var favoriteModel = FavoriteModel.get();
        
        var messageId = request.body.messageId;
        
        if(!messageId){
            self.successResponse(response,Const.responsecodeRemoveFromFavoriteNoMessageId);
            return;
        }
        
        async.waterfall([function(done){
            
            var result = {};
            
            // check existance
            favoriteModel.findOne({
                userId : request.user._id,
                messageId : messageId
            },function(err,findResult){
                
                if(!findResult){
                    self.successResponse(response,Const.responsecodeRemoveFromFavoriteInvalidMessageId);
                    return;
                }
                
                result.favorite = findResult;
                
                done(err,result)
                
            });
            
            
        },
        function(result,done){
            done(null,result)
        },
        function(result,done){
            done(null,result)
        }
        ],
        function(err,result){

            favoriteModel.remove({
                _id : result.favorite.id
            },function(err,removeResult){
                
                if(err){
                    console.log(err);
                    self.errorResponse(response,Const.httpCodeServerError);
                    return;
                }

                self.successResponse(response,Const.responsecodeSucceed);
                
                
            });
            
        });
        
    });
   
    return router;

}

module["exports"] = new RemoveFromFavoriteController();
