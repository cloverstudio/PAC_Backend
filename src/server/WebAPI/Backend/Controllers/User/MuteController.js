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
var SocketAPIHandler = require( pathTop + 'SocketAPI/SocketAPIHandler');

var BackendBase = require('../BackendBase');

var MuteController = function(){
}

_.extend(MuteController.prototype,BackendBase.prototype);

MuteController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v2/user/mute mute / unmute
     * @apiName mute / unmute
     * @apiGroup WebAPI
     * @apiDescription mute / unmute
     * @apiHeader {String} access-token Users unique access-token.

     * @apiParam {String} action action
     * @apiParam {String} target target
     * @apiParam {String} type type
     
     * @apiSuccessExample Success-Response:
{}

**/
    
    router.post('/',tokenChecker,function(request,response){
        
        async.waterfall([function(done){
            
            var result = {};

            // check params
            if(!request.body.action){
                self.successResponse(response,Const.responsecodeMuteWrongParam);
                return;
            }

            if(!request.body.target){
                self.successResponse(response,Const.responsecodeMuteWrongParam);
                return;
            }

            if(!request.body.type){
                self.successResponse(response,Const.responsecodeMuteWrongParam);
                return;
            }

            done(null,result);
            
        },
        function(result,done){

            var result = [];
            var userModel = UserModel.get();

            var target = request.body.target;
            var action = request.body.action;

            var currentMuteList = request.user.muted;
            var isExist = currentMuteList.indexOf(target) != -1;

            if(isExist && action == Const.muteActionUnmute){

                var newList = currentMuteList.filter((inAryTarget) => {
                    return inAryTarget != target;
                });

                userModel.update(
                    { _id: request.user._id }, 
                    { 
                        muted: newList
                    }, 
                    { multi: false }, 
                function(err, updateResult) {
                    
                    done(err, result);
                    
                });

            }
            
            else if(!isExist && action == Const.muteActionMute){

                currentMuteList.push(target);

                userModel.update(
                    { _id: request.user._id }, 
                    { 
                        muted: currentMuteList
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

module["exports"] = new MuteController();
