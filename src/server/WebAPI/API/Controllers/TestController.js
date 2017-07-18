/**  Called for /api/v2/test API */

var _ = require('lodash');
var express = require('express');
var router = express.Router();

var pathTop = "../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');

var APIBase = require('./APIBase');

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

    router.get('',function(request,response){

        self.successResponse(response,Const.responsecodeSucceed,"test");

    });

    return router;
}

module["exports"] = new TestController();
