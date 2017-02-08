/** Called for /api/v2/user/signup API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');
var sha1 = require('sha1');

var pathTop = "../../../../";

var Const = require(pathTop +"lib/consts");
var Config = require(pathTop+ "lib/init");
var Utils = require(pathTop + 'lib/utils');
var UserModel = require(pathTop + 'Models/User');
var GroupModel = require(pathTop + 'Models/Group');
var OrganizationModel = require(pathTop + 'Models/Organization');

var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var SignupController = function(){
}

_.extend(SignupController.prototype,BackendBase.prototype);

SignupController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v2/user/signup/sendSms Signup Send Sms
     * @apiName Signup Send Sms
     * @apiGroup WebAPI
     * @apiDescription Send SMS verification code to user
     *   
     * @apiParam {String} organizationId organizationId 
     * @apiParam {String} phoneNumber phoneNumber
     * 
     * @apiSuccessExample Success-Response:
        {
            code: 1,
            time: 1454417582385,
            data: {}
        }

    */

    router.post('/sendSms', (request, response) => {
        
        var phoneNumber = request.body.phoneNumber;
        var organizationId = request.body.organizationId;

        var activationCode = Utils.getRandomNumber();

        var userModel = UserModel.get();
        var organizationModel = OrganizationModel.get();

        async.waterfall([
            validate,
            addUser,
            sendActivationCode
        ], 
        endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function validate(done) {

            if (_.isEmpty(organizationId))
                return done({ handledError: Const.responsecodeSignupNoOrganizationId });

            // get organization 
            organizationModel.findOne({ organizationId: organizationId }, (err, findResult) => {
                
                if (err)
                    return done(err);
                                
                if(_.isEmpty(findResult))
                    return done({ handledError: Const.responsecodeSigninWrongOrganizationId });                
                
                done(null, { organization: findResult.toObject() });
                                
            });

        };

        function addUser(result, done) {

            userModel.findOne({ 
                userid: phoneNumber, 
                organizationId: result.organization._id.toString(),
                status: Const.userStatus.disabled
            }, (err, findResult) => {
                
                if (err) 
                    return done(err);

                if (findResult) {

                    findResult.activationCode = activationCode;

                    // update user
                    findResult.save((err, saveResult) => {

                        if (err) 
                            return done(err);
                        
                        done(null, result);

                    });

                } 
                else {

                    var data = {      
                        organizationId: result.organization._id,
                        created: Utils.now(),
                        phoneNumber: phoneNumber,
                        userid: phoneNumber,
                        activationCode: activationCode,
                        status: Const.userStatus.disabled,
                        permission: Const.userPermission.webClient
                    };                           
                    
                    // add new user           
                    var user = new userModel(data);
                    user.save((err, saveResult) => {

                        if (err) 
                            return done(err);
                        
                        done(null, result);

                    });  

                }
    
            });         

        };

        function sendActivationCode(result, done) {

            Utils.sendSMS(phoneNumber, self.l10n("Hi! Your activation code is ") + activationCode + ".", (err, message) => {
                done(err, result);      
            });

        };

        function endAsync(err, result) {

            if (err) {
                if (err.handledError) {
                    self.successResponse(response, err.handledError);
                }
                else {
                    console.log(err);
                    self.successResponse(response, Const.responsecodeUnknownError);
                }
            }
            else {
                self.successResponse(response, Const.responsecodeSucceed);                
            }

        };

    });
    
    /**
     * @api {post} /api/v2/user/signup/verify Signup Verify Sms
     * @apiName Signup Verify Sms
     * @apiGroup WebAPI
     * @apiDescription Returns new token for the user.
     *   
     * @apiParam {String} activationCode Activation code received in SMS 

     * 
     * @apiSuccessExample Success-Response:
        {
            code: 1,
            time: 1454417582385,
            data: {
                "newToken": "uSKuT4qC9LQDRHJv",
                "user": {
                    "_id": "588b4f191f8eae1954e9a37c",
                    "organizationId": "test",
                    "created": 1485524761592,
                    "phoneNumber": "+385989057351",
                    "userid": "+385989057351",
                    "activationCode": "815443",
                    "status": 1,
                    "__v": 1,
                    "UUID": [],
                    "devices": [],
                    "blocked": [],
                    "muted": [],
                    "groups": [],
                    "voipPushToken": [],
                    "pushToken": [],
                    "token": [
                        {
                            "generateAt": 1485524904386,
                            "token": "*****"
                        }
                    ]
                }
            }
        }

    */

    router.post('/verify', (request,response) => {
        
        var activationCode = request.body.activationCode;
        
        var userModel = UserModel.get();

        async.waterfall([
            validate,
            enableUser
        ], 
        endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function validate(done) {
            userModel.findOne({ 
                activationCode: activationCode,
                status: Const.userStatus.enabled
            }, (err, findResult) => {
                
                if (err)
                    return done(err);
                    
                if (findResult)
                    return done({ handledError: Const.responsecodeSignupUserAlreadyVerified });

                done(null, {});
    
            });  
        };

        function enableUser(result, done) {

            userModel.findOne({ 
                activationCode: activationCode, 
                status: Const.userStatus.disabled
            }, (err, findResult) => {
                
                if (err) 
                    return done(err);

                if (!findResult) 
                    return done({ handledError: Const.responsecodeSignupInvalidActivationCode });                    

                // create token
                var newToken = Utils.getRandomString(Const.tokenLength);
                
                var tokenObj = {
                    token : newToken,
                    generateAt : Utils.now()
                };
                
                findResult.status = Const.userStatus.enabled;
                findResult.token = tokenObj;

                findResult.save((err, saveResult) => {

                    if (err)
                        return done(err);

                    result.newToken = newToken;
                    result.user = saveResult.toObject();
                    done(null, result);

                });

            });         

        };

        function endAsync(err, result) {

            if (err) {
                if (err.handledError) {
                    self.successResponse(response, err.handledError);
                }
                else {
                    console.log(err);
                    self.successResponse(response, Const.responsecodeUnknownError);
                }
            }
            else {
                self.successResponse(response, Const.responsecodeSucceed, result);                
            }

        };

    });

    /**
     * @api {post} /api/v2/user/signup/finish Signup Finish
     * @apiName Signup Finish
     * @apiGroup WebAPI
     * @apiDescription Updates a user
     *   
     * @apiHeader {String} access-token Users unique access-token.

     * @apiParam {String} name display name
     * @apiParam {String} password hashed password
     * @apiParam {String} secret secret

     * 
     * @apiSuccessExample Success-Response:
        {
            code: 1,
            time: 1454417582385,
            data: {}
        }

    */

    router.post('/finish', tokenChecker, (request,response) => {
        
        var name = request.body.name;
        var password = request.body.password;
        var secret = request.body.secret;  
        var user = request.user;

        var groupModel = GroupModel.get();

        async.waterfall([
            validate,
            getTopDepartment,
            saveUser,
            saveUserToDepartment
        ], 
        endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function validate(done) {

            if(_.isEmpty(name))
                return done({ handledError: Const.responsecodeSignupInvalidUserName });
            
            if(_.isEmpty(password))
                return done({ handledError: Const.responsecodeSignupInvalidPassword });

             // check secret first
            var tenSec = Math.floor(Utils.now() / 1000 / 10);
            var salt = Config.hashSalt;
            
            var candidate1 = salt + (tenSec);
            var candidate2 = salt + (tenSec - 1);
            var candidate3 = salt + (tenSec - 2);
            
            if(sha1(candidate1) == secret || 
                sha1(candidate2) == secret || 
                sha1(candidate3) == secret) {
                
            } 
            else {
                
                if(secret != Config.signinBackDoorSecret) {
                    return done({ handledError: Const.responsecodeSigninWrongSecret });
                }
                
            }

            done(null, {});

        };

        function getTopDepartment(result, done) {

            groupModel.findOne({ 
                organizationId: user.organizationId, 
                type: Const.groupType.department,
                default: true
            }, (err, findResult) => {
                
                if (err) 
                    return done(err);

                result.group = findResult;
                done(null, result);

            });         

        };

        function saveUser(result, done) {

            user.name = name;
            user.sortName = name.toLowerCase();
            user.password = password;
            user.groups = result.group._id;

            user.save((err, saveResult) => {

                if (err)
                    return done(err);

                done(null, result);

            });

        };

        function saveUserToDepartment(result, done) {

            var group = result.group;

            group.users.push(user._id);

            group.save((err, saveResult) => {

                if (err)
                    return done(err);

                done(null, result);

            });

        };

        function endAsync(err, result) {

            if (err) {
                if (err.handledError) {
                    self.successResponse(response, err.handledError);
                }
                else {
                    console.log(err);
                    self.successResponse(response, Const.responsecodeUnknownError);
                }
            }
            else {
                self.successResponse(response, Const.responsecodeSucceed, {});                
            }

        };

    });

    return router;

}

module["exports"] = new SignupController();
