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
var RoomModel = require( pathTop + 'Models/Room');
var UserModel = require( pathTop + 'Models/User');
var OrganizationModel = require( pathTop + 'Models/Organization');
var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var MuteListController = function(){
}

_.extend(MuteListController.prototype,BackendBase.prototype);

MuteListController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v2/user/mutelist MuteList
     * @apiName MuteList
     * @apiGroup WebAPI
     * @apiDescription Returns nothing
     * @apiHeader {String} access-token Users unique access-token.
     * @apiSuccessExample Success-Response:
{}

**/
    
    router.get('/',tokenChecker,function(request,response){
        
        var userModel = UserModel.get();
        var groupModel = GroupModel.get();
        var roomModel = RoomModel.get();

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
            var ids = result.user.muted;

            if(_.isArray(ids) && ids.length > 0){

                userModel.find({
                    _id:{ $in: ids }
                },function(err,findResult){

                    if(findResult){

                        result.users = findResult.map(function(row){
                            
                            return row.toObject();

                        });

                    } else {

                        result.users = [];

                    }


                    done(null,result);

                });

            }else{

                result.users = [];
                done(null,result)
            }
            
        },
        function(result,done){

            // get groups
            var ids = result.user.muted;

            if(_.isArray(ids) && ids.length > 0){

                groupModel.find({
                    _id:{ $in: ids }
                },function(err,findResult){

                    if(findResult){

                        result.groups = findResult.map(function(row){
                            
                            return row.toObject();

                        });

                    } else {

                        result.users = [];

                    }


                    done(null,result);

                });

            }else{

                result.groups = [];
                done(null,result)
            }
            
        },
        function(result,done){

            // get room
            var ids = result.user.muted;

            if(_.isArray(ids) && ids.length > 0){

                roomModel.find({
                    _id:{ $in: ids }
                },function(err,findResult){

                    if(findResult){

                        result.rooms = findResult.map(function(row){
                            
                            return row.toObject();

                        });

                    } else {

                        result.users = [];

                    }


                    done(null,result);

                });

            }else{

                result.rooms = [];
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
                users:result.users,
                groups: result.groups,
                rooms: result.rooms
            });
            
        });
        
    });
   
    return router;

}

module["exports"] = new MuteListController();
