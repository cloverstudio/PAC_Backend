/** Called for /api/v2/user/detail/:id API */

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

var GetOnlineStatusLogic = require( pathTop + 'Logics/GetUserOnlineStatus');

var BackendBase = require('../BackendBase');

var UserDetailController = function(){
}

_.extend(UserDetailController.prototype,BackendBase.prototype);

UserDetailController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v2/user/detail/:userId UserDetail
     * @apiName UserDetail
     * @apiGroup WebAPI
     * @apiDescription Returns user detail
     * @apiHeader {String} access-token Users unique access-token.
     * @apiSuccessExample Success-Response:

{
	"code": 1,
	"time": 1457090503752,
	"data": {
		"user": {
			"_id": "56c32b53db88293409a1ffff",
			"organizationId": "56ab7b9061b760d9eb6feba3",
			"name": "Adam Perez",
			"description": "aperez40@wix.com",
			"userid": "aperez40",
			"password": "*****",
			"status": 1,
			"created": 1455631187121,
			"__v": 0,
			"departments": [],
			"groups": ["56cefbf39543eb2026ba8d5e", "56cefc189543eb2026ba8daa", "56cefc279543eb2026ba8dcc", "56cefc739543eb2026ba8e56", "56cefcd79543eb2026ba8f15", "56cefce19543eb2026ba8f27", "56cf005fff6fef543ccd5a27", "56cf00ea9016d2133ebc01a9", "56cf01db68b9ddba3e63756f", "56cf02b568b9ddba3e637676", "56cf02cb68b9ddba3e637696", "56cf032668b9ddba3e6376fe", "56cf0491235996c850d0b99e", "56cf049b235996c850d0b9a9", "56cf05e6235996c850d0bad9", "56cf0651235996c850d0bb3e", "56cf079bed51d2905e28a642", "56cf0839ed51d2905e28a6df", "56cf085fed51d2905e28a700", "56cf0927ed51d2905e28a780", "56cf0b31ed51d2905e28a8f4", "56cf0b8aed51d2905e28a938", "56cf0bf8ed51d2905e28a98f", "56cf0bfced51d2905e28a991"],
			"avatar": {
				"thumbnail": {
					"originalName": "ljHWzRLBrOFFOrccltYPc8F8MbQgPoKN",
					"size": 1,
					"mimeType": "image/png",
					"nameOnServer": "ljHWzRLBrOFFOrccltYPc8F8MbQgPoKN"
				},
				"picture": {
					"originalName": "Sczhz0ogE7ofXMkp2et39EfS712oR9A4",
					"size": 1,
					"mimeType": "image/png",
					"nameOnServer": "Sczhz0ogE7ofXMkp2et39EfS712oR9A4"
				}
			},
			"groupModels": []
		}
	}
}

**/
    
    router.get('/:userId',tokenChecker,function(request,response){
        
        var userModel = UserModel.get();
        var groupModel = GroupModel.get();
        var userId = request.params.userId;
        
        async.waterfall([function(done){
            
            var result = {};
            
            if(!userId){
                self.successResponse(response,Const.responsecodeUserDetailInvalidUserId);
                return;
            }
            
            userModel.findOne({
                _id:userId
            },function(err,userFindResult){
                
                if(!userFindResult){
                    self.successResponse(response,Const.responsecodeUserDetailInvalidUserId);
                    return;
                }
                
                result.user = userFindResult.toObject();
                done(err,result);
                 
            });
            
        },
        function(result,done){
            
            var groupsLimited = result.user.groups;
            
            if(_.isArray(groupsLimited)){
                
                groupsLimited = groupsLimited.slice(0,20);

                groupsLimited = groupsLimited.map(function(item){
                    return item.toString();
                });

                groupModel.find({
                    _id: {$in : groupsLimited }
                },function(err,groupFindResult){
                    
                    result.user.groupModels = groupFindResult;
                    
                    done(null,result);
                    
                });
            
            } else {
                
                done(null,result);
                
            }
            
        },
        function(result,done){
            
            // get online status
            GetOnlineStatusLogic.get([userId],function(err,onlineStatusResult){

                if (err) {
                    console.log("critical err", err);
                    self.errorResponse(response, Const.httpCodeServerError);
                    return;
                }
                
                if(onlineStatusResult && onlineStatusResult[0])
                    result.user.onlineStatus = onlineStatusResult[0].onlineStatus;
                else
                    result.user.onlineStatus = 0;
                    
                done(null,result);
                
            });
            
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

module["exports"] = new UserDetailController();
