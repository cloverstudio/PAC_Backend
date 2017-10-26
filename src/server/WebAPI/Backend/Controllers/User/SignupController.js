/** Called for /api/v2/user/signup API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');
var sha1 = require('sha1');
var formidable = require('formidable');
var fs = require('fs-extra');
var easyimg = require('easyimage');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var Config = require(pathTop + "lib/init");
var Utils = require(pathTop + 'lib/utils');
var UserModel = require(pathTop + 'Models/User');
var GroupModel = require(pathTop + 'Models/Group');
var OrganizationModel = require(pathTop + 'Models/Organization');
var OrganizationSettingsModel = require(pathTop + 'Models/OrganizationSettings');

var tokenChecker = require(pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var SignupController = function () {
}

_.extend(SignupController.prototype, BackendBase.prototype);

SignupController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {post} /api/v2/user/signup/sendSms Signup Send Sms
      * @apiName Signup Send Sms
      * @apiGroup WebAPI
      * @apiDescription Send SMS verification code to user
      *   
      * @apiParam {String} organizationId organizationId 
      * @apiParam {String} phoneNumber phoneNumber
      * @apiParam {Number=0,1} isWeb if api is called from web (1), otherwise (0)
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
        var isUnitTest = request.body.isUnitTest;
        var isWeb = request.body.isWeb;

        var activationCode = Utils.getRandomNumber();

        var userModel = UserModel.get();
        var organizationModel = OrganizationModel.get();

        async.waterfall([
            validate,
            addUser
        ], endAsync);


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

                if (_.isEmpty(findResult))
                    return done({ handledError: Const.responsecodeSigninWrongOrganizationId });

                done(null, { organization: findResult.toObject() });

            });

        };

        function addUser(result, done) {

            userModel.findOne({
                userid: phoneNumber,
                organizationId: result.organization._id.toString(),
            }, (err, findResult) => {

                if (err)
                    return done(err);

                if (findResult) {

                    Utils.sendSMS(phoneNumber, self.l10n("Hi! Your activation code is ") + activationCode + ".", (err, message) => {

                        if (err)
                            return done(err);

                        findResult.activationCode = activationCode;

                        // update user
                        findResult.save((err, saveResult) => {

                            done(err, result);

                        });

                    });

                }
                else {

                    if (isWeb == 1)
                        return done({ handledError: Const.responsecodeSigninUserNotFound });

                    Utils.sendSMS(phoneNumber, self.l10n("Hi! Your activation code is ") + activationCode + ".", (err, message) => {

                        if (err)
                            return done(err);

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

                            done(err, result);

                        });

                    });

                }

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
                self.successResponse(response, Const.responsecodeSucceed, (isUnitTest ? { activationCode: activationCode } : {}));
            }

        };

    });

    /**
     * @api {post} /api/v2/user/signup/verify Signup Verify Sms
     * @apiName Signup Verify Sms
     * @apiGroup WebAPI
     * @apiDescription Returns new token for the user.
     * 
     * @apiHeader {String} uuid uuid
     *   
     * @apiParam {String} activationCode Activation code received in SMS 
     * @apiParam {String} pushToken pushToken 
     * @apiParam {String} voipPushToken voipPushToken
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

    router.post('/verify', (request, response) => {

        var activationCode = request.body.activationCode;
        var UUID = request.headers['uuid'];

        var userModel = UserModel.get();
        var organizationModel = OrganizationModel.get();
        var organizationSettingsModel = OrganizationSettingsModel.get();

        async.waterfall([
            getUser,
            checkUUID,
            createToken,
            addUUID,
            addPushToken,
            addVoipPushToken,
            saveUser,
            getOrganization
        ], endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function getUser(done) {

            var result = {};

            userModel.findOne({
                activationCode: activationCode,
            }, (err, findResult) => {

                if (err)
                    return done(err);

                if (!findResult)
                    return done({ handledError: Const.responsecodeSignupInvalidActivationCode });

                result.user = findResult;
                done(null, result);

            });

        };

        function checkUUID(result, done) {

            // check UUID

            var uuidAry = result.user.UUID;

            var UUIDSaved = _.filter(uuidAry, (uuidObj) => {
                return uuidObj.UUID == UUID;
            });

            if (UUIDSaved.length > 0) {

                // check blocked
                if (UUIDSaved[0].blocked)
                    return done({ handledError: Const.responsecodeDeviceRejected });

            }

            // check multiple device

            // get organization settings
            organizationSettingsModel.findOne({ organizationId: result.user.organizationId }, function (err, findResult) {

                if (_.isEmpty(findResult))
                    return done(err, result);

                result.organizationSettings = findResult.toObject();

                if (result.organizationSettings.allowMultipleDevice)
                    return done(err, result);

                // get last logined device uuid
                var sortedUUIDs = _.sortBy(uuidAry, function (o) {
                    return -1 * o.lastLogin;
                });

                // allow browser access 
                if (!UUID)
                    return done(err, result);

                var lastLoginedDevice = sortedUUIDs[0];
                // check blocked
                if (lastLoginedDevice && lastLoginedDevice.UUID != UUID)
                    return done({ handledError: Const.responsecodeUserBlocked });

                done(err, result);

            });

        };

        function createToken(result, done) {

            var newToken = Utils.getRandomString(Const.tokenLength);
            var now = Utils.now();

            var tokenObj = {
                token: newToken,
                generateAt: now
            };

            var tokenAry = result.user.token;

            if (!_.isArray(tokenAry))
                tokenAry = [];

            tokenAry.push(tokenObj);

            // cleanup expired tokens
            var cleanedTokenAry = _.filter(tokenAry, function (row) {
                return row.generateAt + Const.tokenValidInteval > now;
            });

            result.newToken = newToken;

            result.user.token = cleanedTokenAry;
            done(null, result);

        };

        function addUUID(result, done) {

            // UUID stuff

            var uuidAry = result.user.UUID;

            if (_.isEmpty(UUID))
                return done(null, result);

            var UUIDSaved = _.filter(uuidAry, (uuidObj) => {
                return uuidObj.UUID == UUID;
            });

            if (UUIDSaved.length > 0) {

                // Update
                UUIDSaved.lastLogin = Utils.now();

                uuidAry = _.map(uuidAry, (uuidObj) => {

                    if (uuidObj.UUID == UUID) {
                        uuidObj.lastLogin = Utils.now();
                        uuidObj.lastToken = result.newToken;
                    }

                    return uuidObj;

                });

            } else {

                // Insert
                var UUIDObj = {
                    UUID: UUID,
                    lastLogin: Utils.now(),
                    blocked: false,
                    lastToken: result.newToken
                }

                if (!uuidAry)
                    uuidAry = [];

                uuidAry.push(UUIDObj);

            }

            uuidAry.lastToken = result.newToken;

            result.user.UUID = uuidAry;
            done(null, result);

        };

        function addPushToken(result, done) {

            if (_.isEmpty(request.body.pushToken))
                return done(null, result);

            var newPushToken = request.body.pushToken;
            var savedPushTokens = result.user.pushToken;

            if (!savedPushTokens || !_.isArray(savedPushTokens))
                savedPushTokens = [];

            if (savedPushTokens.indexOf(newPushToken) != -1)
                return done(null, result);

            savedPushTokens.push(newPushToken);

            result.user.pushToken = savedPushTokens;
            done(null, result);

        };

        function addVoipPushToken(result, done) {

            if (_.isEmpty(request.body.voipPushToken))
                return done(null, result);

            var newPushToken = request.body.voipPushToken;
            var savedPushTokens = result.user.voipPushToken;

            if (!savedPushTokens || !_.isArray(savedPushTokens))
                savedPushTokens = [];

            if (savedPushTokens.indexOf(newPushToken) != -1)
                return done(null, result);

            savedPushTokens.push(newPushToken);

            result.user.voipPushToken = savedPushTokens;
            done(null, result);

        };

        function saveUser(result, done) {

            result.user.save((err, saveResult) => {

                result.user = saveResult.toObject();
                done(err, result);

            });

        };

        function getOrganization(result, done) {

            // get organization 
            organizationModel.findOne({ _id: result.user.organizationId }, (err, findResult) => {

                result.organization = findResult;
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
                self.successResponse(response, Const.responsecodeSucceed, {
                    newToken: result.newToken,
                    user: result.user,
                    organization: result.organization
                });
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
     * @apiParam {String} file avatar file
    
     * 
     * @apiSuccessExample Success-Response:
        {
            code: 1,
            time: 1454417582385,
            data: {
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

    router.post('/finish', tokenChecker, (request, response) => {

        var user = request.user;

        var groupModel = GroupModel.get();

        var form = new formidable.IncomingForm();

        async.waterfall([
            parseForm,
            validate,
            getTopDepartment,
            saveFile,
            saveThumb,
            saveUser,
            saveUserToDepartment
        ], endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function parseForm(done) {

            form.parse(request, function (err, fields, files) {

                // search user
                done(err, { file: files.file, fields: fields });

            });

        };

        function validate(result, done) {

            var name = result.fields.name;
            var password = result.fields.password;
            var secret = result.fields.secret;

            if (_.isEmpty(name))
                return done({ handledError: Const.responsecodeSignupInvalidUserName });

            if (_.isEmpty(password))
                return done({ handledError: Const.responsecodeSignupInvalidPassword });

            // check secret first
            var tenSec = Math.floor(Utils.now() / 1000 / 10);
            var salt = Config.hashSalt;

            var candidate1 = salt + (tenSec);
            var candidate2 = salt + (tenSec - 1);
            var candidate3 = salt + (tenSec - 2);

            if (sha1(candidate1) == secret ||
                sha1(candidate2) == secret ||
                sha1(candidate3) == secret) {

            }
            else {

                if (secret != Config.signinBackDoorSecret)
                    return done({ handledError: Const.responsecodeSigninWrongSecret });

            }

            done(null, result);

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

        function saveFile(result, done) {

            if (!result.file)
                return done(null, result);

            // save to upload dir
            var tempPath = result.file.path;
            var destPath = Config.uploadPath + "/";

            var newFileName = Utils.getRandomString(32);
            result.file.newFileName = newFileName;

            fs.copy(tempPath, destPath + newFileName, function (err) {

                easyimg.convert({ src: destPath + newFileName, dst: destPath + newFileName + ".png", quality: 100 }).then(function (file) {

                    fs.rename(destPath + newFileName + ".png",
                        destPath + newFileName, function (err) {

                            done(err, result);

                        });

                });

            });

        };

        function saveThumb(result, done) {

            if (!result.file)
                return done(null, result);

            var file = result.file;

            // generate thumbnail      
            if (file.type.indexOf("jpeg") > -1 ||
                file.type.indexOf("gif") > -1 ||
                file.type.indexOf("png") > -1) {

                var thumbFileName = Utils.getRandomString(32);
                result.file.thumbName = thumbFileName;

                var destPathTmp = Config.uploadPath + "/" + thumbFileName;

                easyimg.thumbnail({
                    src: Config.uploadPath + "/" + result.file.newFileName,
                    dst: destPathTmp + ".png",
                    width: Const.thumbSize, height: Const.thumbSize
                }).then(

                    function (image) {

                        fs.rename(destPathTmp + ".png",
                            destPathTmp, function (err) {

                                result.file.thumbSize = image.size;
                                done(err, result);

                            });

                    },
                    function (err) {

                        // ignore thubmnail error
                        console.log(err);
                        done(null, result);
                    }

                    );

            }
            else {

                done(null, result);

            }

        };

        function saveUser(result, done) {

            user.name = result.fields.name;
            user.sortName = result.fields.name.toLowerCase();
            user.password = result.fields.password;

            if (_.isEmpty(user.groups))
                user.groups = result.group._id;

            if (result.file) {
                user.avatar = {
                    picture: {
                        originalName: result.file.name,
                        size: result.file.size,
                        mimeType: "image/png",
                        nameOnServer: result.file.newFileName
                    },
                    thumbnail: {
                        originalName: result.file.name,
                        size: result.file.thumbSize,
                        mimeType: "image/png",
                        nameOnServer: result.file.thumbName
                    }
                };
            };

            user.save((err, saveResult) => {

                if (err)
                    return done(err);

                result.user = saveResult.toObject();
                done(null, result);

            });

        };

        function saveUserToDepartment(result, done) {

            var group = result.group;

            if (_.indexOf(group.users, user._id.toString()) > -1)
                return done(null, result);

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
                self.successResponse(response, Const.responsecodeSucceed, { user: result.user });
            }

        };

    });

    return router;

}

module["exports"] = new SignupController();
