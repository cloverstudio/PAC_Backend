/**  Called for /api/v2/user/online API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');
var sha1 = require('sha1');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop +"lib/init");
var DatabaseManager = require( pathTop +'lib/DatabaseManager');
var Utils = require( pathTop +'lib/utils');
var UserModel = require( pathTop + 'Models/User');
var OrganizationModel = require( pathTop + 'Models/Organization');
var GetOnlineStatusLogic = require( pathTop + 'Logics/GetUserOnlineStatus');

var BackendBase = require('../BackendBase');

var GetOnlineStatusController = function(){
}

_.extend(GetOnlineStatusController.prototype,BackendBase.prototype);

GetOnlineStatusController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v2/user/online Get Online Status
     * @apiName Get Online Status
     * @apiGroup WebAPI
     * @apiDescription Get users online status
     *   
     * @apiParam {Array} users array of userid 
     * 
     * @apiParamExample {json} Request-Example:
            {
                users: [
                    "56d36f91906bfe8a1046709b",
                    "56d36f91906bfe8a1046709c",
                    "56d36f91906bfe8a1046709d"
                ]
            }
     * @apiSuccessExample Success-Response:
{
	code: 1,
	time: 1456697234843,
	data: [{
		userId: '56d36f91906bfe8a1046709b',
		onlineStatus: 1
	}, {
		userId: '56d36f91906bfe8a1046709c',
		onlineStatus: 1
	}, {
		userId: '56d36f91906bfe8a1046709d',
		onlineStatus: 0
	}]
}

    */

    router.post('',function(request,response){
        
        var userIds = request.body.users;
        
        if(!_.isArray(userIds)){
            self.successResponse(response,Const.responsecodeGetOnlineStatusInvalidUserId);
            return;
        }
        
        GetOnlineStatusLogic.get(userIds,function(err,result){

            if (err) {
                console.log("critical err", err);
                self.errorResponse(response, Const.httpCodeServerError);
                return;
            }
            
            self.successResponse(response,Const.responsecodeSucceed,result);
            
        });
        
    });
    
    return router;

}

module["exports"] = new GetOnlineStatusController();
