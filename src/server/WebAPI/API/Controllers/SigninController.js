/**  Called for /api/v2/test API */

var _ = require('lodash');
var async = require('async');

var express = require('express');
var router = express.Router();
var sha1 = require('sha1');

var pathTop = "../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var Utils = require( pathTop + "lib/utils");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var checkAPIKey = require( pathTop + 'lib/authApiV3');

var APIBase = require('./APIBase');

var UserModel = require(pathTop + 'Models/User');
var OrganizationModel = require(pathTop + 'Models/Organization');

var SigninController = function(){
}

_.extend(SigninController.prototype,APIBase.prototype);

SigninController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v3/user/signin 
     * @apiName Signin
     **/

    router.post('',checkAPIKey,function(request,response){

        var organization = request.body.organization;
        var username = request.body.username;
        var password = request.body.password;

        var userModel = UserModel.get();
        var organizationModel = OrganizationModel.get();

        if(!organization){
            response.status(422).send('Bad Parameter');
            return;
        }
        
        if(!username){
            response.status(422).send('Bad Parameter');
            return;
        }

        if(!password){
            response.status(422).send('Bad Parameter');
            return;
        }

        async.waterfall([(done) => {

            var result = {};

            // find organization
            organizationModel.findOne({organizationId:organization},function(err,findResult){
                
                if(!findResult){
                    done({
                        status: 403,
                        message: "Wrong username or password"
                    },null)
                    return;
                }
                
                result.organization = findResult.toObject();

                done(err,result);
                                
            });

        },
        (result,done) => {

            var hashedPassword = sha1(password + Config.hashSalt);

            // find user
            userModel.findOne({
                organizationId:result.organization._id,
                userid:username,
                status:1,
                password:hashedPassword
            },function(err,findResult){
                
                if(!findResult){
                    done({
                        status: 403,
                        message: "Wrong username or password"
                    },null);
                    
                    return;
                }
                
                result.user = findResult;

                done(err,result);

            });

        },
        (result,done) => {

            // create new access token
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
                
                result.newAccessToken = newToken;
                result.user.token = newToken;
                result.user.tokenGeneratedAt = now;
                
                done(err,result);
                
            });

        }
        ],
        (err,result) => {

            if(err){    

                if(err.status && err.message)
                    response.status(err.status).send(err.message);
                else
                    response.status(500).send("Server Error");

                return;
            }

            self.successResponse(response,Const.responsecodeSucceed,
            {
                "access-token": result.newAccessToken,
                "user": {
                    "_id": result.user._id,
                    "name": result.user.name,
                    "avatar": result.user.avatar,
                    "description": result.user.description,
                    "organizationId": result.user.organizationId,
                    "sortName": result.user.sortName,
                    "userid": result.user.userid,
                    "blocked":result.user.blocked,
                    "muted": result.user.muted,
                    "created": result.user.created
                },
                "organization": {
                    "_id": result.organization._id,
                    "name": result.organization.name,
                    "created": result.organization.created
                }
            }
            
            );

        });
        
    });


    router.post('/guest',checkAPIKey,function(request,response){

        console.log('guest login',request.body);
        
        var organization = request.body.organization;
        var username = request.body.username;
        var displayname = request.body.displayname;

        var userModel = UserModel.get();
        var organizationModel = OrganizationModel.get();

        if(!organization){
            response.status(422).send('Bad Parameter');
            return;
        }
        
        if(!username){
            response.status(422).send('Bad Parameter');
            return;
        }

        if(!displayname){
            response.status(422).send('Bad Parameter');
            return;
        }

        async.waterfall([(done) => {

            var result = {};

            // find organization
            organizationModel.findOne({organizationId:organization},function(err,findResult){
                
                if(!findResult){
                    done({
                        status: 403,
                        message: "organization"
                    },null)
                    return;
                }
                
                result.organization = findResult.toObject();

                done(err,result);
                                
            });

        },
        (result,done) => {

            // find user
            userModel.findOne({
                organizationId:result.organization._id,
                userid:username,
                isGuest: 1
            },function(err,findResult){
                
                result.user = findResult;

                done(err,result);

            });

        },
        (result,done) => {

            if(result.user)
                return done(null,result);
            
            // create user if doesn't exist
            var user = new userModel({
                name: displayname,
                userid: username,
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
        },
        (result,done) => {

            // create new access token
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
                
                result.newAccessToken = newToken;
                result.user.token = newToken;
                result.user.tokenGeneratedAt = now;
                
                done(err,result);
                
            });

        }
        ],
        (err,result) => {

            if(err){    

                if(err.status && err.message)
                    response.status(err.status).send(err.message);
                else
                    response.status(500).send("Server Error");

                return;
            }

            self.successResponse(response,Const.responsecodeSucceed,
            {
                "access-token": result.newAccessToken,
                "user": {
                    "_id": result.user._id,
                    "name": result.user.name,
                    "avatar": result.user.avatar,
                    "description": result.user.description,
                    "organizationId": result.user.organizationId,
                    "sortName": result.user.sortName,
                    "userid": result.user.userid,
                    "blocked":result.user.blocked,
                    "muted": result.user.muted,
                    "created": result.user.created
                },
                "organization": {
                    "_id": result.organization._id,
                    "name": result.organization.name,
                    "created": result.organization.created
                }
            }
            
            );

        });
        
    });
        
    return router;
}

module["exports"] = new SigninController();
