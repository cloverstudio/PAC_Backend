/** Called for /api/v2/user/signup API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require(pathTop +"lib/consts");
var Config = require(pathTop+ "lib/init");
var Utils = require(pathTop + 'lib/utils');
var UserModel = require(pathTop + 'Models/User');
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

            done(null, {});  
        };

        function addUser(result, done) {

            userModel.findOne({ 
                userid: phoneNumber, 
                organizationId: organizationId,
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
                        organizationId: organizationId,
                        created: Utils.now(),
                        phoneNumber: phoneNumber,
                        userid: phoneNumber,
                        activationCode: activationCode,
                        status: Const.userStatus.disabled
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
                self.successResponse(response, Const.responsecodeSucceed, result);                
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
     * @apiParam {String} password password

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
        var user = request.user;
        
        var userModel = UserModel.get();

        async.waterfall([
            validate,
            saveUser
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

            done(null, {});

        };

        function saveUser(result, done) {

            user.name = name;
            user.sortName = name.toLowerCase();
            user.password = Utils.getHash(password);

            user.save((err, saveResult) => {

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
                self.successResponse(response, Const.responsecodeSucceed, result);                
            }

        };

    });

    return router;

}

module["exports"] = new SignupController();
