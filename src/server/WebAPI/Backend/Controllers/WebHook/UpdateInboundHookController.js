/** Called for /api/v2/hook/in/update API */

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
var UpdateInboundHook = require( pathTop + 'Logics/UpdateInboundHook');

var BackendBase = require('../BackendBase');

var AddInboundHookController = function(){
}

_.extend(AddInboundHookController.prototype,BackendBase.prototype);

AddInboundHookController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v2/hook/in/update UpdateInboundHook
     * @apiName UpdateInboundHook
     * @apiGroup WebAPI
     * @apiDescription Returns hook
     * @apiHeader {String} access-token Users unique access-token.
     * @apiParam {String} hookId
     * @apiParam {Number} targetType 1:user 2:group 3:room
     * @apiParam {String} targetId
     * @apiSuccessExample Success-Response:
{
	code: 1,
	time: 1458827082658,
	data: {
		hook: {
			_id: '56f3ef4a716487a4b40ee081',
			userId: '56f3ef48716487a4b40ee075',
			identifier: 'WMJbh5HtdBiO',
			targetType: 3,
			targetId: '56f3ef49716487a4b40ee07d',
			hookType: 1,
			url: '',
			created: 1458827082625,
			__v: 0
		}
	}
}

**/
    
    router.post('/',tokenChecker,function(request,response){
        
        UpdateInboundHook.update(request.body.hookId,
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
