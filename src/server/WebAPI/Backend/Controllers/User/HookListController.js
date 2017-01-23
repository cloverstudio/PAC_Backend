/** Called for /api/v2/user/hooks API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var Utils = require( pathTop + 'lib/utils');
var HookModel = require( pathTop + 'Models/Hook');
var GetChatTargetModels = require( pathTop + 'Logics/GetChatTargetModels');
var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var HookListController = function(){
}

_.extend(HookListController.prototype,BackendBase.prototype);

HookListController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v2/user/hooks HooksList
     * @apiName HooksList
     * @apiGroup WebAPI
     * @apiDescription Returns list of hooks of the caller user
     * @apiHeader {String} access-token Users unique access-token.
     * @apiSuccessExample Success-Response:
{
	code: 1,
	time: 1458894561251,
	data: {
		hooks: [{
			_id: '56f4f6e14a8e10185fca7049',
			userId: '56f4f6df4a8e10185fca703c',
			identifier: 'I4lq8pTlOSDv',
			targetType: 2,
			targetId: '56f4f6df4a8e10185fca7040',
			hookType: 1,
			url: '',
			created: 1458894561098,
			__v: 0,
			groupModel: {
				_id: '56f4f6df4a8e10185fca7040',
				name: 'GROUP 1',
				sortName: 'group 1',
				description: 'GROUP 1 DESCRIPTION',
				created: 1458894559075,
				organizationId: '56f4f6de4a8e10185fca703b',
				__v: 0,
				users: ['56f4f6df4a8e10185fca703c',
					'56f4f6df4a8e10185fca703d',
					'56f4f6df4a8e10185fca703e',
					'56f4f6df4a8e10185fca703f'
				],
				avatar: {
					thumbnail: {
						originalName: 'user1.jpg',
						size: 11800,
						mimeType: 'jpeg',
						nameOnServer: '3KcOVW9HHXHyMrPRqNrJHUFUSBiUcQ4f'
					},
					picture: {
						originalName: 'user1.jpg',
						size: 36023,
						mimeType: 'image/jpeg',
						nameOnServer: 'J9aAM3LhnmUkUvg6LX9eLJXyyBTX8uNo'
					}
				}
			}
		}, {
			_id: '56f4f6e14a8e10185fca704a',
			userId: '56f4f6df4a8e10185fca703c',
			identifier: 'mdtNpPVLuVbb',
			targetType: 3,
			targetId: '56f4f6e04a8e10185fca7044',
			hookType: 1,
			url: '',
			created: 1458894561107,
			__v: 0,
			roomModel: {
				_id: '56f4f6e04a8e10185fca7044',
				description: 'description',
				owner: '56f4f6df4a8e10185fca703c',
				name: 'Room1Changeg',
				created: 1458894560293,
				__v: 0,
				modified: 1458894560613,
				avatar: {
					thumbnail: {
						originalName: 'max.jpg',
						size: 64914,
						mimeType: 'image/png',
						nameOnServer: 'p6fwL5coh17AcvkxZkS67i2nyGoFqDZQ'
					},
					picture: {
						originalName: 'max.jpg',
						size: 64914,
						mimeType: 'image/png',
						nameOnServer: 'D0NsZIxcxnjWSvGuwXHKz4Fy5GYGl44c'
					}
				},
				users: ['56f4f6df4a8e10185fca703c',
					'56f4f6df4a8e10185fca703d',
					'56f4f6df4a8e10185fca703e'
				]
			}
		}, {
			_id: '56f4f6e14a8e10185fca704b',
			userId: '56f4f6df4a8e10185fca703c',
			identifier: '',
			hookType: 2,
			url: 'http://www.clover-studio.com',
			targetType: 1,
			targetId: '56f4f6df4a8e10185fca703c',
			created: 1458894561160,
			__v: 0,
			userModel: {
				_id: '56f4f6df4a8e10185fca703c',
				name: 'test',
				userid: 'userid1wAySm',
				password: '*****',
				organizationId: '56f4f6de4a8e10185fca703b',
				created: 1458894559028,
				status: 1,
				__v: 0,
				description: null,
				groups: [],
				avatar: {
					thumbnail: {
						originalName: 'max.jpg',
						size: 64914,
						mimeType: 'image/png',
						nameOnServer: 'YrHMzm60C5aLlE0h95yfSp4rGDKUI00h'
					},
					picture: {
						originalName: 'max.jpg',
						size: 64914,
						mimeType: 'image/png',
						nameOnServer: 'B1Uda2BmtPaDWbk9Sw3JTJL74bxZG188'
					}
				},
				pushToken: ['pushtoken'],
				token: [{
					generateAt: 1458894559375,
					token: '*****'
				}]
			}
		}, {
			_id: '56f4f6e14a8e10185fca704c',
			userId: '56f4f6df4a8e10185fca703c',
			identifier: '',
			hookType: 2,
			url: 'http://www.clover-studio.com',
			targetType: 2,
			targetId: '56f4f6df4a8e10185fca7040',
			created: 1458894561171,
			__v: 0,
			groupModel: {
				_id: '56f4f6df4a8e10185fca7040',
				name: 'GROUP 1',
				sortName: 'group 1',
				description: 'GROUP 1 DESCRIPTION',
				created: 1458894559075,
				organizationId: '56f4f6de4a8e10185fca703b',
				__v: 0,
				users: ['56f4f6df4a8e10185fca703c',
					'56f4f6df4a8e10185fca703d',
					'56f4f6df4a8e10185fca703e',
					'56f4f6df4a8e10185fca703f'
				],
				avatar: {
					thumbnail: {
						originalName: 'user1.jpg',
						size: 11800,
						mimeType: 'jpeg',
						nameOnServer: '3KcOVW9HHXHyMrPRqNrJHUFUSBiUcQ4f'
					},
					picture: {
						originalName: 'user1.jpg',
						size: 36023,
						mimeType: 'image/jpeg',
						nameOnServer: 'J9aAM3LhnmUkUvg6LX9eLJXyyBTX8uNo'
					}
				}
			}
		}]
	}
}

**/
    
    router.get('/',tokenChecker,function(request,response){
        
        var hookModel = HookModel.get();
        
        async.waterfall([function(done){
            
            var result = {};
            
            hookModel.find({
                userId: request.user._id.toString()
            },function(err,findResult){
                
                result.list = findResult.map(function(item){
                    return item.toObject();
                });
                
                done(err,result);
            });
            
            
        },
        function(result,done){
            
            var params = _.map(result.list,function(row){
                
                return{
                    type: row.targetType,
                    id: row.targetId
                }
                
            });
            
            GetChatTargetModels.get(params,function(err,allModels){
                
                result.allModels = allModels;
                done(err,result);
                 
            });
            
        }
        ],
        function(err,result){
            
            var responseAry = _.map(result.list,function(row){

                if(row.targetType == Const.chatTypePrivate){
                    row.userModel = _.find(result.allModels.users,function(model){
                        return model._id.toString() == row.targetId;
                    });
                }

                if(row.targetType == Const.chatTypeGroup){
                    row.groupModel = _.find(result.allModels.groups,function(model){
                        return model._id.toString() == row.targetId;
                    });
                }

                if(row.targetType == Const.chatTypeRoom){
                    row.roomModel = _.find(result.allModels.rooms,function(model){
                        return model._id.toString() == row.targetId;
                    });
                }
                
                
                return row;
                 
            });
            
            
            if(err){
                console.log("critical err",err);
                self.errorResponse(response,Const.httpCodeServerError);
                return;
            }
            
            self.successResponse(response,Const.responsecodeSucceed,{
                hooks : responseAry
            });
            
        });
        
    });
   
    return router;

}

module["exports"] = new HookListController();
