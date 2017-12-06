/** Called for /api/v2/room/users/add API */

var express = require('express');
var router = express.Router();
var sha1 = require('sha1');
var bodyParser = require("body-parser");
var _ = require('lodash');
var async = require('async');
var validator = require('validator');
var fs = require('fs-extra');
var formidable = require('formidable');
var easyimg = require('easyimage');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var Utils = require( pathTop + 'lib/utils');

var UserModel = require( pathTop + 'Models/User');
var RoomModel = require( pathTop + 'Models/Room');
var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var AddUsersToRoomController = function(){}

_.extend(AddUsersToRoomController.prototype,BackendBase.prototype);

AddUsersToRoomController.prototype.init = function(app){
        
    var self = this;


   /**
     * @api {post} /api/v2/room/users/add Add users to room
     * @apiName Add users to room
     * @apiGroup WebAPI
     * @apiDescription Update profile of conversation
     * @apiHeader {String} access-Token Users unique access-token.
     * @apiParam {string} roomId roomId
     * @apiParam {Array} users Array of user ids

     * @apiSuccessExample Success-Response:
{
	"code": 1,
	"time": 1457082886197,
	"data": {
		"room": {
			"_id": "56d94c88bf06a1f30ad6091d",
            "owner" : "56c32acd331dd81f8134f200"
			"ownerModel": {
				"_id": "56c32acd331dd81f8134f200",
				"name": "Ken",
				"sortName": "ken yasue",
				"description": "ああああ",
				"userid": "kenyasue",
				"password": "*****",
				"created": 1455631053660,
				"status": 1,
				"organizationId": "56ab7b9061b760d9eb6feba3",
				"__v": 0,
				"tokenGeneratedAt": 1457082869691,
				"token": "*****",
				"departments": [],
				"groups": ["56cf0a60ed51d2905e28a848"],
				"avatar": {
					"thumbnail": {
						"originalName": "2015-01-11 21.30.05 HDR.jpg",
						"size": 1551587,
						"mimeType": "image/png",
						"nameOnServer": "c2gQT5IMJAYqx89eo8gwFrKJSRxlFYFU"
					},
					"picture": {
						"originalName": "2015-01-11 21.30.05 HDR.jpg",
						"size": 1551587,
						"mimeType": "image/png",
						"nameOnServer": "jf7mBTsU6CVfFPLsnY4Ijqcuo6vYTKAs"
					}
				}
			},
			"name": "ああああああ",
			"created": 1457081480907,
			"__v": 0,
			"description": "いいいいいddd",
			"modified": 1457082886193,
			"avatar": {
				"thumbnail": {
					"originalName": "2014-06-03 17.23.39.jpg",
					"size": 1504586,
					"mimeType": "image/png",
					"nameOnServer": "ut4G1A3Jq9LbfeDxXUh8jibgDB4wPGV1"
				},
				"picture": {
					"originalName": "2014-06-03 17.23.39.jpg",
					"size": 1504586,
					"mimeType": "image/png",
					"nameOnServer": "egStPNb3ysJKhUGtyeFzcwKCPgmp5Cnj"
				}
			},
			"users": ["56c32acd331dd81f8134f200"]
		}
	}
}
    */
    router.post('/',tokenChecker,function(request,response){

        var roomId = request.body.roomId
        var roomModel = RoomModel.get();
        var userModel = UserModel.get();
        var users = request.body.users;
        
        var user = request.user;

        if(!_.isArray(users)){
            self.successResponse(response,Const.responsecodeAddUsersToRoomWrongUserId);
            return; 
        }
        
        var result = {};
             
        async.waterfall([

            function (done) {
                
            	roomModel.findOne({_id:roomId},function(err,roomFindResult){
	            	
	            	if(!roomFindResult){
		            	
                        self.successResponse(response,Const.responsecodeAddUsersToRoomWrongRoomId);
		            	
		            	return;
	            	}
                    
                    if (roomFindResult.owner != user._id.toString())
                        return self.successResponse(response, Const.responsecodeAddUsersToRoomUserIsNotOwner);
                    
	            	result.targetRoom = roomFindResult.toObject();
	            		            	
	            	done(err,result);
	            	
            	});
            	          
            },
                        
            function (result,done){
                
                var usersFilterd = _.filter(users,function(userId){
                    
                    return Utils.isObjectId(userId);
                        
                });
                
                // filter users
                userModel.find({
                    _id:{ $in : usersFilterd}
                },function(err,userFindResult){
                    result.users = userFindResult;
                    done(err,result);
                });

            },
            function (result,done){
                
                var userIdsExistsObjectId = _.pluck(result.users,"_id");
                var userIdsExistsStr = _.map(userIdsExistsObjectId,function(userIdObj){
                    return userIdObj.toString();    
                });
                
                var usersOld = result.targetRoom.users;
                var newUsers = usersOld.concat(userIdsExistsStr);
                newUsers = _.unique(newUsers);
                
                roomModel.update({
                    _id:result.targetRoom._id
                },{
                    users:newUsers
                },function(err,updateResult){
                    
                    done(err,result);
                
                });

            },
            function (result,done){
                
            	roomModel.findOne({_id:roomId},function(err,roomFindResult){
                    
                    roomFindResult = roomFindResult.toObject();
                    roomFindResult.ownerModel = request.user;
	            	result.updatedData = roomFindResult;
	            		            	
	            	done(err,result);
	            	
            	});

            },
            
        ],
            function (err, result) {
                
                if(err){
                    
                    self.errorResponse(response,Const.httpCodeServerError);   
                                     
                }else {
                              
                    self.successResponse(response,Const.responsecodeSucceed,{
                        room : result.updatedData
                    });
                       
                }
                             
            }
            
        );
        
    });
	
    return router;
    
}

module["exports"] = new AddUsersToRoomController();
