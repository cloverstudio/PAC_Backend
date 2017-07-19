/**  Called for /api/v2/test API */

var _ = require('lodash');
var express = require('express');
var router = express.Router();

var pathTop = "../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var Utils = require( pathTop + "lib/utils");

var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var checkAPIKey = require( pathTop + 'lib/authApiV3');

var APIBase = require('./APIBase');

var apikeyModel = require(pathTop + 'Models/APIKey.js').get();
var organizationModel = require(pathTop + 'Models/Organization.js').get();

var TestController = function(){
}

_.extend(TestController.prototype,APIBase.prototype);

TestController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v3/test just test
     * @apiName just test
     * @apiGroup WebAPI
     * @apiDescription Returns text "test"
     **/

    router.get('',checkAPIKey,function(request,response){

        self.successResponse(response,Const.responsecodeSucceed,"test");

    });

    if(Config.isTest){

        router.post('/createapikey',function(request,response){

            var organizationId = request.body.organizationId;
            var newAPIKey = Utils.getRandomString(Const.APIKeyLength);

            // save API key
            var apikey = new apikeyModel({
                organizationId: organizationId,
                key: newAPIKey,
                state: 1,
                created: Utils.now()
            });

            // save to DB          
            apikey.save(function(err, saveResult) {

                self.successResponse(response,Const.responsecodeSucceed,saveResult);
            
            });

        });

    }
    return router;
}

module["exports"] = new TestController();
