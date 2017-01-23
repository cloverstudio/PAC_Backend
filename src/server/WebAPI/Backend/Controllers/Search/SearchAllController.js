/** Called for /api/v2/search/all/:page?keyword=keyword API */

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
var SearchGroupLogic = require( pathTop + 'Logics/SearchGroup');
var SearchRoomLogic = require( pathTop + 'Logics/SearchRoom');

var BackendBase = require('../BackendBase');

var UserDetailController = function(){
}

_.extend(UserDetailController.prototype,BackendBase.prototype);

UserDetailController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v2/search/all/:page?keyword=keyword Search user/group/room
     * @apiName SearchAll
     * @apiGroup WebAPI
     * @apiDescription Returns users groups rooms matches to the keyword
     * @apiHeader {String} access-token Users unique access-token.
     * @apiSuccessExample Success-Response:
{
	"code": 1,
	"time": 1458048275869,
	"data": {
		"list": [{
			"_id": "56e19ec20dc358a4c4c1bab3",
			"owner": "56c32acd331dd81f8134f200",
			"name": "Ken",
			"created": 1457626818892,
			"__v": 0,
			"description": "test",
			"modified": 1457962642422,
			"avatar": {
				"thumbnail": {
					"originalName": "wAO6OLzQqrdRaT9xP15pFmcCJGcKSuo1",
					"size": 112325,
					"mimeType": "image/png",
					"nameOnServer": "wAO6OLzQqrdRaT9xP15pFmcCJGcKSuo1"
				},
				"picture": {
					"originalName": "wAO6OLzQqrdRaT9xP15pFmcCJGcKSuo1",
					"size": 112325,
					"mimeType": "image/png",
					"nameOnServer": "wAO6OLzQqrdRaT9xP15pFmcCJGcKSuo1"
				}
			},
			"users": ["56c32acd331dd81f8134f200"],
			"type": 3
		}, {
			"_id": "56e6b6ec06552124125cdb88",
			"owner": "56c32acd331dd81f8134f200",
			"name": "Ken Test 1",
			"created": 1457960684510,
			"__v": 0,
			"description": "ddddd",
			"modified": 1457968944671,
			"avatar": {
				"thumbnail": {
					"originalName": "2014-06-03 17.23.38.jpg",
					"size": 1438407,
					"mimeType": "image/png",
					"nameOnServer": "D5SXoOQKhDnHZOJWTgla2jV00uIhaElp"
				},
				"picture": {
					"originalName": "2014-06-03 17.23.38.jpg",
					"size": 1438407,
					"mimeType": "image/png",
					"nameOnServer": "BKg0DwlNPvI7tyUKZ7I1C2aMmusMzK9R"
				}
			},
			"users": ["56c32acd331dd81f8134f200", "56e6b6d206552124125cdb86", "56e6b73d06552124125cdb92"],
			"type": 3
		}, {
			"_id": "56cdd4268c2de60868f7d7cc",
			"owner": "56c32acd331dd81f8134f200",
			"name": "Test Room",
			"created": 1456329766450,
			"__v": 0,
			"avatar": {
				"thumbnail": {
					"originalName": "ar12oQdbhh2QFOR9FzMVmi9ZRoc9j7KR",
					"size": 127310,
					"mimeType": "image/png",
					"nameOnServer": "ar12oQdbhh2QFOR9FzMVmi9ZRoc9j7KR"
				},
				"picture": {
					"originalName": "ar12oQdbhh2QFOR9FzMVmi9ZRoc9j7KR",
					"size": 127310,
					"mimeType": "image/png",
					"nameOnServer": "ar12oQdbhh2QFOR9FzMVmi9ZRoc9j7KR"
				}
			},
			"users": ["56c32acd331dd81f8134f200", "56c32b35db88293409a1ff82", "56c32b53db88293409a1ffff", "56c32b59db88293409a20019", "56c32b5edb88293409a2002f", "56c32b66db88293409a2004a", "56c32b7bdb88293409a20091", "56c32b8bdb88293409a200cf", "56c32bb0db88293409a20170", "56c32bb4db88293409a2017e", "56c32bd6db88293409a2020e", "56c32be8db88293409a2025e", "56c32bf3db88293409a2028c", "56c32bf6db88293409a20299", "56c32bf7db88293409a2029c", "56c32c21db88293409a2034e"],
			"type": 3
		}, {
			"_id": "56d95be8a852b06d19b0d537",
			"description": "test",
			"owner": "56c32acd331dd81f8134f200",
			"name": "Test Room",
			"created": 1457085416115,
			"__v": 0,
			"avatar": {
				"thumbnail": {
					"originalName": "Sxm8Hjk7M6XmHdeGLOjuHZeVH8veSLq4",
					"size": 113213,
					"mimeType": "image/png",
					"nameOnServer": "Sxm8Hjk7M6XmHdeGLOjuHZeVH8veSLq4"
				},
				"picture": {
					"originalName": "Sxm8Hjk7M6XmHdeGLOjuHZeVH8veSLq4",
					"size": 113213,
					"mimeType": "image/png",
					"nameOnServer": "Sxm8Hjk7M6XmHdeGLOjuHZeVH8veSLq4"
				}
			},
			"users": ["56c32acd331dd81f8134f200", "56c32b5edb88293409a2002f", "56c32baddb88293409a20162"],
			"type": 3
		}, {
			"_id": "56d95d27437835f2199ebbe3",
			"description": "Test Room",
			"owner": "56c32acd331dd81f8134f200",
			"name": "Test Room1",
			"created": 1457085735694,
			"__v": 0,
			"avatar": {
				"thumbnail": {
					"originalName": "tL3TxBiNX04SBYAjjmIbgT7Um42L2i6b",
					"size": 115851,
					"mimeType": "image/png",
					"nameOnServer": "tL3TxBiNX04SBYAjjmIbgT7Um42L2i6b"
				},
				"picture": {
					"originalName": "tL3TxBiNX04SBYAjjmIbgT7Um42L2i6b",
					"size": 115851,
					"mimeType": "image/png",
					"nameOnServer": "tL3TxBiNX04SBYAjjmIbgT7Um42L2i6b"
				}
			},
			"users": ["56c32acd331dd81f8134f200", "56c32b5edb88293409a2002f", "56c32b66db88293409a2004a", "56c32bf7db88293409a2029c"],
			"type": 3
		}, {
			"_id": "56e7ef842500caf2eda5d5fb",
			"name": "atest",
			"sortName": "atest",
			"description": "",
			"created": 1458040708283,
			"organizationId": "56ab7b9061b760d9eb6feba3",
			"type": 2,
			"__v": 0,
			"users": ["56c32acd331dd81f8134f200"],
			"usersCount": 1,
			"userModels": [{
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
				"tokenGeneratedAt": 1458048265940,
				"token": "*****",
				"groups": ["56e7ef842500caf2eda5d5fb", "56e7da1671be6b38d3beb967", "56dee2fd1f9b351bcd4e5469"],
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
			}]
		}, {
			"_id": "56e7da1671be6b38d3beb967",
			"name": "test",
			"sortName": "test",
			"description": "test",
			"created": 1458035222590,
			"organizationId": "56ab7b9061b760d9eb6feba3",
			"type": 2,
			"__v": 0,
			"users": ["56c32acd331dd81f8134f200"],
			"usersCount": 1,
			"userModels": [{
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
				"tokenGeneratedAt": 1458048265940,
				"token": "*****",
				"groups": ["56e7ef842500caf2eda5d5fb", "56e7da1671be6b38d3beb967", "56dee2fd1f9b351bcd4e5469"],
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
			}]
		}],
		"count": 7
	}
}

**/
    
    router.get('/:page',tokenChecker,function(request,response){
        
        var keyword = request.query.keyword;
        var page = request.params.page - 1;
        
        async.waterfall([function(done){
            
            var result = {};

            SearchRoomLogic.search(request.user,keyword,page,function(data){
                
                result.rooms = data.list.map(function(item){
                    item.type = Const.chatTypeRoom;
                    
                    return item;
                });
                
                result.count = data.count;
                
                done(null,result)
                
            },function(err){
                done(err,result)
            });
            
        },
        function(result,done){

            SearchUserLogic.search(request.user,keyword,page,function(data){

                result.users = data.list.map(function(item){
                    item.type = Const.chatTypePrivate;
                    
                    return item;
                });
                
                result.count += data.count;
                
                done(null,result)
                
            },function(err){
                done(err,result)
            });
            
        },
        function(result,done){

            SearchGroupLogic.search(request.user,keyword,page,function(data){

                result.groups = data.list.map(function(item){
                    item.type = Const.chatTypeGroup;
                    
                    return item;
                });
                
                result.count += data.count;
                
                done(null,result)
                
            },function(err){
                done(err,result)
            });
            
        },
        function(result,done){
            
            var allTogether = [];
            allTogether = allTogether.concat(result.rooms).concat(result.users).concat(result.groups);
            
            _.forEach(allTogether,function(obj){
                
                //console.log(obj.name);
                 
            });
            allTogether = _.sortBy(allTogether, function(o) { 
                
                if(o.sortName)
                    return o.sortName;
                else
                    return o.name; 
                    
            });
            
            _.forEach(allTogether,function(obj){
                
                //console.log(obj.name);
                 
            });
            
            result.list = allTogether;
            
            done(null,result)
        }
        ],
        function(err,result){
            
            if(err){
                console.log("critical err",err);
                self.errorResponse(response,Const.httpCodeServerError);
                return;
            }
            
            self.successResponse(response,Const.responsecodeSucceed,{
                list : result.list,
                count : result.count
            });
            
        });
        
    });
   
    return router;

}

module["exports"] = new UserDetailController();
