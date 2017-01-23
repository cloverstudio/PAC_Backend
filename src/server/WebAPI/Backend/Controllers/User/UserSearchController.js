/**  Called for /api/v2/user/search/:page?keyword= API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var Utils = require( pathTop + 'lib/utils');
var tokenChecker = require( pathTop + 'lib/authApi');
var SearchUserLogic = require( pathTop + 'Logics/SearchUser');

var BackendBase = require('../BackendBase');

var UserSearchController = function(){
}

_.extend(UserSearchController.prototype,BackendBase.prototype);

UserSearchController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v2/user/search/:page?keyword=******** search user
     * @apiName Seach User
     * @apiGroup WebAPI
     * @apiDescription Returns users matched to keyword
     * @apiHeader {String} access-token Users unique access-token.
     * @apiSuccessExample Success-Response:
{
    code: 1,
    time: 1456698684520,
    data: {
        list: [{
            _id: '56d3753c294ed9761afe489c',
            name: 'user1',
            userid: 'userid1ilmaN',
            password: '*****',
            organizationId: '56d3753b294ed9761afe489b',
            created: 1456698684006,
            status: 1,
            __v: 0,
            tokenGeneratedAt: 1456698684452,
            token: '*****',
            departments: [],
            groups: [],
            onelineStatus: 0
        }],
        count: 1
    }
}
**/

    router.get('/',tokenChecker,function(request,response){
        
        var keyword = request.query.keyword;

        SearchUserLogic.search(request.user,keyword,0,function(result,errorCode){
            
            self.successResponse(response,Const.responsecodeSucceed, {
                list: result.list,
                count: result.count
            });
            
        },function(err){

            console.log("critical err",err);
            self.errorResponse(response,Const.httpCodeServerError);
            return;
        
        });
        
    });
    
    router.get('/:page',tokenChecker,function(request,response){
        
        var keyword = request.query.keyword;
        var page = request.params.page - 1;

        SearchUserLogic.search(request.user,keyword,page,function(result,errorCode){
            
            self.successResponse(response,Const.responsecodeSucceed, {
                list: result.list,
                count: result.count
            });
            
        },function(err){

            console.log("critical err",err);
            self.errorResponse(response,Const.httpCodeServerError);
            return;
        
        });

    });
   
    return router;

}

module["exports"] = new UserSearchController();