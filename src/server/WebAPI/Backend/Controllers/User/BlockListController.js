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

var BlockListController = function(){
}

_.extend(BlockListController.prototype,BackendBase.prototype);

BlockListController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v2/user/blocklist BlockList
     * @apiName BlockList
     * @apiGroup WebAPI
     * @apiDescription Returns nothing
     * @apiHeader {String} access-token Users unique access-token.
     * @apiSuccessExample Success-Response:
{}

**/
    
    router.get('/',tokenChecker,function(request,response){
        
        var userModel = UserModel.get();

        async.waterfall([function(done){
            
            var result = {};

            userModel.findOne(
                { _id: request.user._id }, 
            function(err, findResult) {

                if(!findResult)
                    err = "no user";

                result.user = findResult;
                done(err, result);
                
            });

        },
        function(result,done){

            // get Users
            var users = result.user.blocked;

            if(_.isArray(users) && users.length > 0){

                userModel.find({
                    _id:{ $in: users }
                },function(err,findResult){

                    result.users = findResult.map(function(row){
                        
                        return row.toObject();

                    });

                    done(null,result);

                });

            }else{

                result.users = [];
                done(null,result)
            }

        }
        ],
        function(err,result){
            
            if(err){
                console.log("critical err",err);
                self.errorResponse(response,Const.httpCodeServerError);
                return;
            }
            
            self.successResponse(response,Const.responsecodeSucceed,{
                list:result.users
            });
            
        });
        
    });
   
    return router;

}

module["exports"] = new BlockListController();
