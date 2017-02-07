/** Called for /api/v2/user/savepushtoken API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');
var sha1 = require('sha1');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var Utils = require( pathTop + 'lib/utils');
var tokenChecker = require( pathTop + 'lib/authApi');
var UserModel = require( pathTop + 'Models/User');
var OrganizationModel = require( pathTop + 'Models/Organization');

var BackendBase = require('../BackendBase');

var SavePushTokenController = function(){
}

_.extend(SavePushTokenController.prototype,BackendBase.prototype);

SavePushTokenController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v2/user/savevoippushtoken SaveVoipPushToken
     * @apiName SaveVoipPushToken
     * @apiGroup WebAPI
     * @apiDescription Save Voip push token to user model
     * @apiHeader {String} access-token Users unique access-token.
     *   
     * @apiParam {String} pushToken pushToken for push notification service
     * 
     * @apiSuccessExample Success-Response:
{
	code: 1,
	time: 1454417582385,
	data: {
		user: {
			_id: '56b0a6ae6753ea416ad58ea9',
			name: 'user1',
			userid: 'userid1ixfQJ',
			password: '*****',
			created: 1454417582354,
			__v: 0,
			token: '*****',
			tokenGeneratedAt: 1454417582384,
            pushToken : ["test","test1"]
		}
	}
}

    */

    router.post('',tokenChecker,function(request,response){
        
        // check params
        if(_.isEmpty(request.body.pushToken)){
            self.successResponse(response,Const.responsecodeSavePushTokenWrongToken);
            return;
        }

        // simple validation passed
        var userModel = UserModel.get();
        
        async.waterfall([
            
            function(done){
                
                var result = {};
                
                var userObj = request.user.toObject();
                result.user = userObj;
                
                var newPushToken = request.body.pushToken;
                var savedPushTokens = userObj.voipPushToken;

                if(!savedPushTokens || !_.isArray(savedPushTokens))
                        savedPushTokens = [];

                if(savedPushTokens.indexOf(newPushToken) == -1){
                    
                    savedPushTokens.push(newPushToken);
                    
                    userModel.update(
                        {_id:userObj._id},{
                        voipPushToken: savedPushTokens
                    },function(err,updateResult){
                        
                        result.user.voipPushToken = savedPushTokens;
                        done(err,result);
                        
                    });
                    
                }else{
                    
                    done(null,result);
                    
                } 
                  
            },
            function(result,done){

                // link pushtoken to UUID
                var UUID = request.headers['uuid']; 
                var newPushToken = request.body.pushToken;
                var savedUUIDs = request.user.UUID;
                var changed = false;

                if(UUID && newPushToken && savedUUIDs){

                    _.forEach(savedUUIDs,(o) => {
                        
                        if(o.UUID == UUID){

                            if(!o.pushTokens){
                                o.pushTokens = [];
                            }

                            if(o.pushTokens.indexOf(newPushToken) == -1){
                                o.pushTokens.push(newPushToken);
                                changed = true;
                            }
                            
                        }   
                            
                    });    

                    if(changed){

                        userModel.update(
                            {_id:request.user._id},{
                            UUID: savedUUIDs
                        },function(err,updateResult){
                            
                            done(err,result);
                            
                        });

                    } else {

                        done(null,result);

                    }           

                } else{

                    done(null,result);

                }

            }
        ],
        function(err,result){
            
            if(err){
                console.log("critical err",err);
                self.errorResponse(response,Const.httpCodeServerError);
                return;
            }
            
            var responseData = {
                user : result.user
            }
            
            self.successResponse(response,Const.responsecodeSucceed,responseData);

        });

    });
    
    return router;

}

module["exports"] = new SavePushTokenController();
