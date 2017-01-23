/** Called for /api/v2/hook/in/remove API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var Utils = require( pathTop + 'lib/utils');
var HookModel = require( pathTop + 'Models/Hook');
var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var RemoveInboundHookController = function(){
}

_.extend(RemoveInboundHookController.prototype,BackendBase.prototype);

RemoveInboundHookController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v2/hook/in/remove RemoveInboundHook
     * @apiName RemoveInboundHook
     * @apiGroup WebAPI
     * @apiDescription Remove from favorite
     * @apiHeader {String} access-token Users unique access-token.
     * @apiParam {string} hookId hookId
     * @apiSuccessExample Success-Response:
{
	"code": 1,
	"time": 1457363319718
}

**/
    
    
    router.post('/',tokenChecker,function(request,response){

        var hookModel = HookModel.get();
        
        var hookId = request.body.hookId;
        
        if(!hookId){
            self.successResponse(response,Const.responsecodeRemoveInboundHookWrongHookId);
            return;
        }
        
        async.waterfall([function(done){
            
            var result = {};
            
            // check existance
            hookModel.findOne({
                _id : hookId
            },function(err,findResult){
                
                if(!findResult){
                    self.successResponse(response,Const.responsecodeRemoveInboundHookWrongHookId);
                    return;
                }
                
                result.hook = findResult;
                
                done(err,result)
                
            });
            
            
        },
        function(result,done){
            done(null,result)
        }
        ],
        function(err,result){
            
            hookModel.remove({
                _id : result.hook._id
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

module["exports"] = new RemoveInboundHookController();
