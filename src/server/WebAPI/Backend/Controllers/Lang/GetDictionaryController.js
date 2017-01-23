/** Called for /api/v2/lang/get API  */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");

var BackendBase = require('../BackendBase');

var langText = {
    jp: require(pathTop + "lib/lang/jp.js")
}

var GetDictionaryController = function(){
}

_.extend(GetDictionaryController.prototype,BackendBase.prototype);

GetDictionaryController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v2/lang/get get dictionary
     * @apiName Get Dictionary
     * @apiGroup WebAPI
     * @apiDescription get dictionary basend on cookie saved lang
     * @apiSuccessExample Success-Response:
{}
**/

    router.get('/',function(request,response){
        
        var dictionary = {};
        var lang = request.cookies.lang;
        
        if(lang){
            dictionary = langText[lang];
        }

        self.successResponse(response,Const.responsecodeSucceed,dictionary);
        
    });

    return router;

}

module["exports"] = new GetDictionaryController();
