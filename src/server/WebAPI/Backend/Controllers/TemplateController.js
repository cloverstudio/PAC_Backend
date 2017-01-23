/** Copy this file when create new controller  */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var Utils = require( pathTop + 'lib/utils');
var GroupModel = require( pathTop + 'Models/Group');
var UserModel = require( pathTop + 'Models/User');
var OrganizationModel = require( pathTop + 'Models/Organization');
var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var UserDetailController = function(){
}

_.extend(UserDetailController.prototype,BackendBase.prototype);

UserDetailController.prototype.init = function(app){
        
    var self = this;

    
    router.get('/:userId',tokenChecker,function(request,response){
        
        async.waterfall([function(done){
            
            var result = {};
            
            done(null,result)
        },
        function(result,done){
            done(null,result)
        }
        ],
        function(err,result){
            
            if(err){
                console.log("critical err",err);
                self.errorResponse(response,Const.httpCodeServerError);
                return;
            }
            
            self.successResponse(response,Const.responsecodeSucceed,result);
            
        });
        
    });
   
    return router;

}

module["exports"] = new UserDetailController();
