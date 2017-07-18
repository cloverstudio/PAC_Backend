/**  Called for /api/v2/test API */

var _ = require('lodash');
var express = require('express');
var router = express.Router();

var pathTop = "../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');

var APIBase = require('./APIBase');

var SigninController = function(){
}

_.extend(SigninController.prototype,APIBase.prototype);

SigninController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v3/user/signin 
     * @apiName Signin
     **/

    router.post('',function(request,response){

        self.successResponse(response,Const.responsecodeSucceed,"test");

    });

    return router;
}

module["exports"] = new SigninController();
