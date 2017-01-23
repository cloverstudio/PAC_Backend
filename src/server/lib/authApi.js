/** Auth checker for HTTP API */

var _ = require('lodash');
var async = require('async');

var Const = require("./consts");
var Config = require("./init");
var DatabaseManager = require('./DatabaseManager');
var Utils = require('./utils');

var userModel = require('../Models/User').get();

function checkToken(request, response, next) {
    
    var token = request.headers['access-token'];
    
    if(_.isEmpty(token)){

        response.json({
            code : Const.responsecodeSigninInvalidToken
        });
        
        return;
    }

    userModel.findOne({
        "token.token":token
    },function(err,findResult){
        
        if(_.isEmpty(findResult)){

            response.json({
                code : Const.responsecodeSigninInvalidToken
            });
        
            return;
        }

        var tokenObj = _.find(findResult.token,function(tokenObjInAry){
            return tokenObjInAry.token == token;
        });
        
        var tokenGenerated = tokenObj.generateAt;
        
        var diff = Utils.now() - tokenGenerated;

        if(diff > Const.tokenValidInteval){

            response.json({
                code : Const.responsecodeSigninInvalidToken
            });
        
            return;
            
        }
        
        request.user = findResult;
        
        next();
        
    });
    
}

module.exports = checkToken;