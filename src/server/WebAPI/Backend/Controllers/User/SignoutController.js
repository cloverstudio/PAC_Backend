/** Called for /api/v2/user/signout API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');
var sha1 = require('sha1');

var pathTop = "../../../../";

var Const = require(pathTop +"lib/consts");
var Config = require(pathTop+ "lib/init");
var DatabaseManager = require(pathTop + 'lib/DatabaseManager');
var Utils = require(pathTop + 'lib/utils');
var UserModel = require(pathTop + 'Models/User');
var OrganizationModel = require(pathTop + 'Models/Organization');
var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var SignoutController = function(){
}

_.extend(SignoutController.prototype,BackendBase.prototype);

SignoutController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v2/user/signout SignOut
     * @apiName Signin
     * @apiGroup WebAPI
     * @apiDescription nothing
     * @apiSuccessExample Success-Response:
{
	code: 1,
	time: 1454417582385
}

    */

    router.post('',tokenChecker,function(request,response){

        var userModel = UserModel.get();
        var organizationModel = OrganizationModel.get();
        
        async.waterfall([
        
			function(done){
                
                var result = {};
                
                userModel.update({
                    _id: request.user._id
                },{
                    token: [],
                    pushToken: [],
                    voipPushToken: []
                },{},function(){

                    done(null,result);
                });
                
            },
            function(result,done){
                
                // make user offline
                DatabaseManager.redisDel(Const.redisKeyOnlineStatus + request.user._id);

                done(null,result);
                
            }
        ],
        function(err,result){
            
            if(err){
                console.log("critical err",err);
                self.errorResponse(response,Const.httpCodeServerError);
                return;
            }
            
            self.successResponse(response,Const.responsecodeSucceed,[]);

        });

    });


    return router;

}

module["exports"] = new SignoutController();
