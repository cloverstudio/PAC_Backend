/** Called for /api/v2/hook/in/add API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var Utils = require( pathTop + 'lib/utils');
var tokenChecker = require( pathTop + 'lib/authApi');
var NewInboundHook = require( pathTop + 'Logics/NewInboundHook');

var BackendBase = require('../BackendBase');

var AddInboundHookController = function(){
}

_.extend(AddInboundHookController.prototype,BackendBase.prototype);

AddInboundHookController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v2/hook/in/add AddNewInboundHook
     * @apiName AddNewInboundHook
     * @apiGroup WebAPI
     * @apiDescription Returns nothing
     * @apiHeader {String} access-token Users unique access-token.
     * @apiParam {Number} targetType 1:user 2:group 3:room
     * @apiParam {String} targetId
     * @apiSuccessExample Success-Response:
{
	code: 1,
	time: 1458827045780,
	data: {
		hook: {
			__v: 0,
			userId: '56f3ef23a8769830b480f52a',
			identifier: 'TcXAofnpRrEn',
			targetType: 1,
			targetId: '56f3ef23a8769830b480f52a',
			hookType: 1,
			url: '',
			created: 1458827045779,
			_id: '56f3ef25a8769830b480f536'
		}
	}
}

**/
    
    router.post('/',tokenChecker,function(request,response){
        
        NewInboundHook.create(request.user._id.toString(),
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

module["exports"] = new AddInboundHookController();
