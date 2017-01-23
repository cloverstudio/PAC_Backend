/** Called for /api/v2/room/detail/:id API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var Utils = require( pathTop + 'lib/utils');
var RoomModel = require( pathTop + 'Models/Room');
var UserModel = require( pathTop + 'Models/User');
var OrganizationModel = require( pathTop + 'Models/Organization');
var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var RoomDetailController = function(){
}

_.extend(RoomDetailController.prototype,BackendBase.prototype);

RoomDetailController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v2/room/detail/:roomId RoomDetail
     * @apiName RoomDetail
     * @apiGroup WebAPI
     * @apiDescription Returns room detail
     * @apiHeader {String} access-token Users unique access-token.
     * @apiSuccessExample Success-Response:

{
	code: 1,
	time: 1457092969492,
	data: {
		room: {
			_id: '56d979690c0ce24041304b43',
			description: 'description',
			owner: '56d979670c0ce24041304b3b',
			name: 'Room1Changeg',
			created: 1457092969060,
			__v: 0,
			modified: 1457092969368,
			avatar: {
				thumbnail: {
					originalName: 'max.jpg',
					size: 64914,
					mimeType: 'image/png',
					nameOnServer: 'p9qj4omrwLGRJ2HY0ycDGRBnWZ8sSdNC'
				},
				picture: {
					originalName: 'max.jpg',
					size: 64914,
					mimeType: 'image/png',
					nameOnServer: 'm5K6IcDbFPLA7Rb802JyLgdUENnp065j'
				}
			},
			users: ['56d979670c0ce24041304b3b',
				'56d979670c0ce24041304b3c',
				'56d979670c0ce24041304b3d'
			],
			userModels: [{
				_id: '56d979670c0ce24041304b3b',
				name: 'test',
				userid: 'userid1VLoM0',
				password: '*****',
				organizationId: '56d979670c0ce24041304b3a',
				created: 1457092967847,
				status: 1,
				__v: 0,
				tokenGeneratedAt: 1457092968300,
				token: '*****',
				description: null,
				departments: [],
				groups: [],
				avatar: {
					thumbnail: {
						originalName: 'max.jpg',
						size: 64914,
						mimeType: 'image/png',
						nameOnServer: 'If9mccjOJGIDezaV9s8B3wtLLvIL1QcB'
					},
					picture: {
						originalName: 'max.jpg',
						size: 64914,
						mimeType: 'image/png',
						nameOnServer: 'CXOAffrBqgWfXzr5ytywezBZh4KVUbJV'
					}
				}
			}, {
				_id: '56d979670c0ce24041304b3c',
				name: 'User2',
				userid: 'userid2AztOz',
				password: '*****',
				organizationId: '56d979670c0ce24041304b3a',
				created: 1457092967858,
				status: 1,
				__v: 0,
				tokenGeneratedAt: 1457092968295,
				token: '*****',
				description: null,
				departments: [],
				groups: [],
				avatar: {
					thumbnail: {
						originalName: 'user1.jpg',
						size: 36023,
						mimeType: 'image/png',
						nameOnServer: 'g7AmtxYWVfZxFWzoc5LFytnVd9LhLiUu'
					},
					picture: {
						originalName: 'user1.jpg',
						size: 36023,
						mimeType: 'image/png',
						nameOnServer: 'cOObVhMSjSxTHiw4UWBdy28A2bvSaevn'
					}
				}
			}, {
				_id: '56d979670c0ce24041304b3d',
				name: 'User3',
				userid: 'userid3xPYBs',
				password: '*****',
				organizationId: '56d979670c0ce24041304b3a',
				created: 1457092967864,
				status: 1,
				__v: 0,
				tokenGeneratedAt: 1457092968297,
				token: '*****',
				description: null,
				departments: [],
				groups: [],
				avatar: {
					thumbnail: {
						originalName: 'user2.jpg',
						size: 53586,
						mimeType: 'image/png',
						nameOnServer: 'AVa6NQdeKc83NPYvy9Y7G5RJdDKN6Fpw'
					},
					picture: {
						originalName: 'user2.jpg',
						size: 53586,
						mimeType: 'image/png',
						nameOnServer: 'druLJc3iituP5BAiHx7sNMmNuKkjd3rP'
					}
				}
			}]
		}
	}
}

**/
    
    router.get('/:roomId',tokenChecker,function(request,response){
        
        var userModel = UserModel.get();
        var roomModel = RoomModel.get();
        
        async.waterfall([function(done){
            
            var result = {};
            
            var roomId = request.params.roomId;

            if(!roomId){
                self.successResponse(response,Const.responsecodeRoomDetailInvalidRoomId);
                return;
            }
            
            roomModel.findOne({_id:roomId},function(err,roomFindResult){

                if(!roomFindResult){
                    self.successResponse(response,Const.responsecodeRoomDetailInvalidRoomId);
                    return;
                }
                
                result.room = roomFindResult.toObject();
                done(err,result);
                 
            });
            
        },
        function(result,done){
            
            var usersLimited = result.room.users;
            
            if(_.isArray(usersLimited)){
                
                usersLimited.slice(0,4);
                
                userModel.find({
                    _id: {$in : result.room.users }
                },function(err,userFindResult){
                    
                    result.room.userModels = userFindResult;
                    
                    done(null,result);
                    
                });
            
            } else {
                
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

module["exports"] = new RoomDetailController();
