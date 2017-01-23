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

var BlockUserController = function(){
}

_.extend(BlockUserController.prototype,BackendBase.prototype);

BlockUserController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v2/user/block Block/Unblock user
     * @apiName Block
     * @apiGroup WebAPI
     * @apiDescription Block/Unblock user
     * @apiHeader {String} access-token Users unique access-token.
     * @apiParam {string} action action
     * @apiParam {string} target target
     
     * @apiSuccessExample Success-Response:
{}

**/
    
    router.post('/',tokenChecker,function(request,response){
        
        async.waterfall([function(done){
            
            var result = {};
            
            // check params
            if(_.isEmpty(request.body.action)){
                self.successResponse(response,Const.responsecodeBlockWrongParam);
                return;
            }

            if(_.isEmpty(request.body.target)){
                self.successResponse(response,Const.responsecodeBlockWrongParam);
                return;
            }

            done(null,result);

        },
        function(result,done){


            var result = [];
            var userModel = UserModel.get();

            var target = request.body.target;
            var action = request.body.action;

            var currentBlockList = request.user.blocked;

            if(_.isEmpty(currentBlockList))
                currentBlockList = [];

            var isExist = currentBlockList.indexOf(target) != -1;

            if(isExist && action == Const.blockActionUnblock){

                var newList = currentBlockList.filter((inAryTarget) => {
                    return inAryTarget != target;
                });

                userModel.update(
                    { _id: request.user._id }, 
                    { 
                        blocked: newList
                    }, 
                    { multi: false }, 
                function(err, updateResult) {

                    done(err, result);
                    
                });

            }
            
            else if(!isExist && action == Const.blockActionBlock){

                currentBlockList.push(target);

                userModel.update(
                    { _id: request.user._id }, 
                    { 
                        blocked: currentBlockList
                    }, 
                    { multi: false }, 
                function(err, updateResult) {

                    done(err, result);
                    
                });

            }

            else {
                done(null,result);
            }

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

module["exports"] = new BlockUserController();
