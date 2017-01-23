/** Called for /api/v2/user/signin API */

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
var OrganizationSettingsModel = require(pathTop + 'Models/OrganizationSettings');

var BackendBase = require('../BackendBase');

var SigninController = function(){
}

_.extend(SigninController.prototype,BackendBase.prototype);

SigninController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v2/user/signin Signin
     * @apiName Signin
     * @apiGroup WebAPI
     * @apiDescription Returns new token for the user.
     *   
     * @apiParam {String} organizationid organizationid 
     * @apiParam {String} userid userid 
     * @apiParam {String} password hashed password
     * @apiParam {String} pushToken pushToken for push notification service
     * @apiParam {String} secret secret
     * @apiParam {String} UUID UUID
     * 
     * @apiSuccessExample Success-Response:
{
	code: 1,
	time: 1454417582385,
	data: {
		newToken: 'DOqsolWe6zt3EFn0',
		user: {
			_id: '56b0a6ae6753ea416ad58ea9',
			name: 'user1',
			userid: 'userid1ixfQJ',
			password: '*****',
			created: 1454417582354,
			__v: 0,
			token: '*****',
			tokenGeneratedAt: 1454417582384
		},
		organization: {
			_id: '56b0a6ae6753ea416ad58ea8',
			organizationId: 'clover',
			name: 'user1',
			created: 1454417582336,
			status: 1,
			__v: 0
		}
	}
}

    */

    router.post('',function(request,response){
        
        // check params

        if(_.isEmpty(request.body.organizationid)){
            self.successResponse(response,Const.responsecodeSigninNoOrganizationid);
            return;
        }
        
        if(_.isEmpty(request.body.userid)){
            self.successResponse(response,Const.responsecodeSigninNoUserid);
            return;
        }

        if(_.isEmpty(request.body.password)){
            self.successResponse(response,Const.responsecodeSigninNoPassword);
            return;
        }
        
        if(_.isEmpty(request.body.secret)){
            self.successResponse(response,Const.responsecodeSigninWrongSecret);
            return;
        }
        
        var organizationid = request.body.organizationid;
        var userid = request.body.userid;
        var password = request.body.password;
        var secret = request.body.secret;  
        var UUID = request.body.UUID;           
        
        // check secret first
        var tenSec = Math.floor(Utils.now() / 1000 / 10);
        var salt = Config.hashSalt;
        
        var candidate1 = salt + (tenSec);
        var candidate2 = salt + (tenSec - 1);
        var candidate3 = salt + (tenSec - 2);
        
        if(sha1(candidate1) == secret || 
            sha1(candidate2) == secret || 
            sha1(candidate3) == secret){
            
            
        } else {
            
            if(secret != Config.signinBackDoorSecret){
                self.successResponse(response,Const.responsecodeSigninWrongSecret);
                return;
            }
            
        }
        
        // simple validation passed
        var userModel = UserModel.get();
        var organizationModel = OrganizationModel.get();
        var organizationSettingsModel = OrganizationSettingsModel.get();

        async.waterfall([
        
			function(done){
                
                var result = {};
                
                // get organization 
                organizationModel.findOne({organizationId:organizationid},function(err,findResult){
                    
                    if(_.isEmpty(findResult)){
                        self.successResponse(response,Const.responsecodeSigninWrongOrganizationId);
                        return;
                    }
                    
                    result.organization = findResult.toObject();

                    done(err,result);
                                    
                });
                
            },
            function(result,done){
                
                // get user 
                userModel.findOne({
                					organizationId:result.organization._id.toString(),
                					userid:userid,
                                    status:1,
                					password:password},function(err,findResult){
                    
                    if(_.isEmpty(findResult)){
                        self.successResponse(response,Const.responsecodeSigninWrongUserCredentials);
                        return;
                    }

                    result.user = findResult.toObject();
                    
                    done(err,result);
                                    
                });
                
            },
            function(result,done){

                // check UUID

                var uuidAry = result.user.UUID;

                var UUIDSaved = _.filter(uuidAry,(uuidObj) => {
                    return uuidObj.UUID == UUID;
                });
                
                if(UUIDSaved.length > 0){

                    // check blocked
                    if(UUIDSaved[0].blocked){
                        self.successResponse(response,Const.responsecodeDeviceRejected);
                        return;
                    }

                }

                // check multiple device

                // get organization settings
                organizationSettingsModel.findOne({organizationId:result.user.organizationId},function(err,findResult){
                    
                    if(_.isEmpty(findResult)){
                        done(err,result);
                        return;
                    }
                    
                    result.organizationSettings = findResult.toObject();

                    if(result.organizationSettings.allowMultipleDevice === 0){

                        // get last logined device uuid
                        var sortedUUIDs = _.sortBy(uuidAry,
                            function(o) { 
                                return -1 * o.lastLogin; 
                            }
                        );

                        // allow browser access 
                        if(!UUID){
                            done(null,result);
                            return;
                        } 

                        var lastLoginedDevice = sortedUUIDs[0];

                        // check blocked
                        if(lastLoginedDevice && lastLoginedDevice.UUID != UUID){
                            self.successResponse(response,Const.responsecodeUserBlocked);
                            return;
                        }
                        
                        done(null,result);

                    }else{

                        done(null,result);

                    }
                
                });

            },
            function(result,done){
                
                var newToken = Utils.getRandomString(Const.tokenLength);
                var now = Utils.now();
                
                var tokenObj = {
                    token : newToken,
                    generateAt : now
                };
                
                var tokenAry = result.user.token;
                
                if(!_.isArray(tokenAry)){
                    tokenAry = [];
                }
                
                tokenAry.push(tokenObj);
                
                // cleanup expired tokens
                var cleanedTokenAry = _.filter(tokenAry,function(row){
                    return row.generateAt + Const.tokenValidInteval > now;
                });
                
                // update user
                userModel.update(
                    {_id:result.user._id},{
                    token: cleanedTokenAry
                },function(err,updateResult){
                    
                    result.user.token = newToken;
                    result.user.tokenGeneratedAt = now;
                    
                    done(err,result);
                    
                });
                
            },
            function(result,done){

                // UUID stuff

                var uuidAry = result.user.UUID;

                if(_.isEmpty(UUID)){
                    done(null,result);
                    return;
                }
                
                var UUIDSaved = _.filter(uuidAry,(uuidObj) => {
                    return uuidObj.UUID == UUID;
                });
                
                if(UUIDSaved.length > 0){

                    // Update
                    UUIDSaved.lastLogin = Utils.now();

                    uuidAry = _.map(uuidAry,(uuidObj) => {

                        if(uuidObj.UUID == UUID){
                            uuidObj.lastLogin = Utils.now();
                            uuidObj.lastToken = result.user.token;
                        }

                        return uuidObj;

                    });

                } else {
                    
                    // Insert
                    var UUIDObj = {
                        UUID : UUID,
                        lastLogin : Utils.now(),
                        blocked : false,
                        lastToken : result.user.token
                    }

                    if(!uuidAry)
                        uuidAry = [];

                    uuidAry.push(UUIDObj);

                }

                uuidAry.lastToken = result.user.token;

                userModel.update(
                    {_id:result.user._id},{
                    UUID: uuidAry
                },function(err,updateResult){
                    
                    done(err,result);
                    
                });

            },
            function(result,done){
                
                if(!_.isEmpty(request.body.pushToken)){
                    
                    var newPushToken = request.body.pushToken;
                    var savedPushTokens = result.user.pushToken;
                    
                    if(!savedPushTokens || !_.isArray(savedPushTokens))
                        savedPushTokens = [];

                    if(savedPushTokens.indexOf(newPushToken) == -1){
                        
                        savedPushTokens.push(newPushToken);
                        
                        userModel.update(
                            {_id:result.user._id},{
                            pushToken: savedPushTokens
                        },function(err,updateResult){
                            
                            result.user.pushToken = savedPushTokens;
                            done(err,result);
                            
                        });
                        
                    }else{
                        
                        done(null,result);
                        
                    }
                    
                    
                }else{
                    done(null,result);
                }
                
            },
            function(result,done){
                
                if(!_.isEmpty(request.body.voipPushToken)){
                    
                    var newPushToken = request.body.voipPushToken;
                    var savedPushTokens = result.user.voipPushToken;
                    
                    if(!savedPushTokens || !_.isArray(savedPushTokens))
                        savedPushTokens = [];

                    if(savedPushTokens.indexOf(newPushToken) == -1){
                        
                        savedPushTokens.push(newPushToken);
                        
                        userModel.update(
                            {_id:result.user._id},{
                            voipPushToken: savedPushTokens
                        },function(err,updateResult){
                            
                            result.user.pushToken = savedPushTokens;
                            done(err,result);
                            
                        });
                        
                    }else{
                        
                        done(null,result);
                        
                    }
                    
                    
                }else{
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
                newToken : result.user.token,
                user : result.user,
                organization: result.organization
            }
            
            self.successResponse(response,Const.responsecodeSucceed,responseData);

        });

    });



   /**
     * @api {post} /api/v2/user/signin/guest Guest Signin
     * @apiName  Guest Signin
     * @apiGroup WebAPI
     * @apiDescription Returns new token for guest user.
     *   
     * @apiParam {String} organizationid organizationid 
     * @apiParam {String} userid userid 
     * @apiParam {String} pushToken pushToken for push notification service
     * @apiParam {String} voipPushToken pushToken for push notification service
     * @apiParam {String} secret secret
     * 
     * @apiSuccessExample Success-Response:
{
	code: 1,
	time: 1454417582385,
	data: {
		newToken: 'DOqsolWe6zt3EFn0',
		user: {
			_id: '56b0a6ae6753ea416ad58ea9',
			name: 'user1',
			userid: 'userid1ixfQJ',
			password: '*****',
			created: 1454417582354,
			__v: 0,
			token: '*****',
			tokenGeneratedAt: 1454417582384
		},
		organization: {
			_id: '56b0a6ae6753ea416ad58ea8',
			organizationId: 'clover',
			name: 'user1',
			created: 1454417582336,
			status: 1,
			__v: 0
		}
	}
}

    */

    router.post('/guest',function(request,response){
        
        // check params

        if(_.isEmpty(request.body.organizationid)){
            self.successResponse(response,Const.responsecodeSigninNoOrganizationid);
            return;
        }
        
        if(_.isEmpty(request.body.userid)){
            self.successResponse(response,Const.responsecodeSigninNoUserid);
            return;
        }
        
        if(_.isEmpty(request.body.secret)){
            self.successResponse(response,Const.responsecodeSigninWrongSecret);
            return;
        }
        
        var organizationid = request.body.organizationid;
        var userid = request.body.userid;
        var secret = request.body.secret;             
        
        // check secret first
        var tenSec = Math.floor(Utils.now() / 1000 / 10);
        var salt = Config.hashSalt;
        
        var candidate1 = salt + (tenSec);
        var candidate2 = salt + (tenSec - 1);
        var candidate3 = salt + (tenSec - 2);
        
        if(sha1(candidate1) == secret || 
            sha1(candidate2) == secret || 
            sha1(candidate3) == secret){
            
            
        } else {
            
            if(secret != Config.signinBackDoorSecret){
                self.successResponse(response,Const.responsecodeSigninWrongSecret);
                return;
            }
            
        }
        
        // simple validation passed
        var userModel = UserModel.get();
        var organizationModel = OrganizationModel.get();
        
        async.waterfall([
        
			function(done){
                
                var result = {};
                
                // get organization 
                organizationModel.findOne({organizationId:organizationid},function(err,findResult){
                    
                    if(_.isEmpty(findResult)){
                        self.successResponse(response,Const.responsecodeSigninWrongOrganizationId);
                        return;
                    }
                    
                    result.organization = findResult.toObject();
                    
                    done(err,result);
                                    
                });
                
            },
            function(result,done){
                
                // get user 
                userModel.findOne({
                					organizationId:result.organization._id.toString(),
                					userid:userid
                                  },function(err,findResult){
                    
                    if(_.isEmpty(findResult)){
                        result.user = null;
                    }else{
                        result.user = findResult.toObject();
                    }

                    done(err,result);
                                    
                });
                
            },
            function(result,done){
                
                // create new guest user if not exists
                if(!result.user){
                    
                    var user = new userModel({
                        name: "Guest User",
                        userid: userid,
                        password: "",
                        isGuest: 1,
                        organizationId : result.organization._id.toString(),
                        created: Utils.now(),
                        status: 1
                    });
                    
                    user.save(function(err,saveResult){
                        
                        result.user = saveResult;
                        done(err,result);
                        
                    });
                    
                }else{
                    
                    done(null,result);
                    
                }
            },
            function(result,done){
                
                var newToken = Utils.getRandomString(Const.tokenLength);
                var now = Utils.now();
                
                var tokenObj = {
                    token : newToken,
                    generateAt : now
                };
                
                var tokenAry = result.user.token;
                
                if(!_.isArray(tokenAry)){
                    tokenAry = [];
                }
                
                tokenAry.push(tokenObj);
                
                // cleanup expired tokens

                var cleanedTokenAry = _.filter(tokenAry,function(row){
                    
                    return row.generateAt + Const.tokenValidInteval > now;
                     
                });
                
                // update user
                userModel.update(
                    {_id:result.user._id},{
                    token: cleanedTokenAry
                },function(err,updateResult){
                    
                    result.user.token = newToken;
                    result.user.tokenGeneratedAt = now;
                    result.newToken = newToken;

                    done(err,result);
                    
                });
                
            },
            function(result,done){
                
                if(!_.isEmpty(request.body.pushToken)){
                    
                    var newPushToken = request.body.pushToken;
                    var savedPushTokens = result.user.pushToken;
                    
                    if(!savedPushTokens || !_.isArray(savedPushTokens))
                        savedPushTokens = [];

                    if(savedPushTokens.indexOf(newPushToken) == -1){
                        
                        savedPushTokens.push(newPushToken);
                        
                        userModel.update(
                            {_id:result.user._id},{
                            pushToken: savedPushTokens
                        },function(err,updateResult){
                            
                            result.user.pushToken = savedPushTokens;
                            done(err,result);
                            
                        });
                        
                    }else{
                        
                        done(null,result);
                        
                    }
                    
                    
                }else{
                    done(null,result);
                }
                
            },
            function(result,done){
                
                if(!_.isEmpty(request.body.voipPushToken)){
                    
                    var newPushToken = request.body.voipPushToken;
                    var savedPushTokens = result.user.voipPushToken;
                    
                    if(!savedPushTokens || !_.isArray(savedPushTokens))
                        savedPushTokens = [];

                    if(savedPushTokens.indexOf(newPushToken) == -1){
                        
                        savedPushTokens.push(newPushToken);
                        
                        userModel.update(
                            {_id:result.user._id},{
                            voipPushToken: savedPushTokens
                        },function(err,updateResult){
                            
                            result.user.voipPushToken = savedPushTokens;
                            done(err,result);
                            
                        });
                        
                    }else{
                        
                        done(null,result);
                        
                    }
                    
                    
                }else{
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
                newToken : result.newToken,
                user : result.user,
                organization: result.organization
            }
            
            self.successResponse(response,Const.responsecodeSucceed,responseData);

        });

    });
    
    
    return router;

}

module["exports"] = new SigninController();
