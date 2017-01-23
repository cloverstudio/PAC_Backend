/** Called for /api/v2/hook/out/add API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var Utils = require( pathTop + 'lib/utils');
var NewOutgoingHook = require( pathTop + 'Logics/NewOutgoingHook');
var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var AddOutgoingHookController = function(){
}

_.extend(AddOutgoingHookController.prototype,BackendBase.prototype);

AddOutgoingHookController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v2/hook/out/add AddNewOutgoingHook
     * @apiName AddNewOutgoingHook
     * @apiGroup WebAPI
     * @apiDescription Returns nothing
     * @apiHeader {String} access-token Users unique access-token.
     * @apiParam {Number} targetType 1:user 2:group 3:room
     * @apiParam {String} targetId
     * @apiSuccessExample Success-Response:
{
	code: 1,
	time: 1458827160294,
	data: {
		hook: {
			__v: 0,
			userId: '56f3ef96ab5396acb5346830',
			identifier: '',
			hookType: 2,
			url: 'http://www.clover-studio.com',
			created: 1458827160292,
			_id: '56f3ef98ab5396acb534683f'
		}
	}
}

**/
    
    router.post('/',tokenChecker,function(request,response){
        
        NewOutgoingHook.create(request.user._id.toString(),
                                request.body.url,
                                request.body.targetType,
                                request.body.targetId,
                                function(errCode,newHook){
            
            if(errCode){
                self.successResponse(response,errCode);
            }else{
                self.successResponse(response,Const.responsecodeSucceed,{
                    hook:newHook
                });
            }
            
        })
        
    });

    return router;

}

module["exports"] = new AddOutgoingHookController();
