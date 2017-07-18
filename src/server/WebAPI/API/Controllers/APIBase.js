/**  Base Controlelr for all Backend API Controllers */

var _ = require('lodash');
var async = require('async');

var pathTop = "../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var Utils = require( pathTop + 'lib/utils');

var APIBase = function(){
    
}

var Base = require('../../BaseController');

_.extend(APIBase.prototype,Base.prototype);

APIBase.prototype.errorResponse = function(
        response,
        httpCode){

    response.status(httpCode);
    response.send("");
    
}

APIBase.prototype.successResponse = function(response,code,data){
    
    response.status(Const.httpCodeSucceed);
    response.set('connection','Keep-alive');

    response.json(data);
    
}

module["exports"] = APIBase;