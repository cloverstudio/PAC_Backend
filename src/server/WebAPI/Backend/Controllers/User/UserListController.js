/** Called for /api/v2/user/list/:page API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var Config = require(pathTop + "lib/init");
var Utils = require(pathTop + 'lib/utils');
var tokenChecker = require(pathTop + 'lib/authApi');
var SearchUserLogic = require(pathTop + 'Logics/SearchUser');

var UserModel = require( pathTop + 'Models/User');

var BackendBase = require('../BackendBase');

var UserListController = function(){
}

_.extend(UserListController.prototype,BackendBase.prototype);

UserListController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v2/user/list/:page userlist
     * @apiName List User
     * @apiGroup WebAPI
     * @apiDescription Returns all users
     * @apiHeader {String} access-token Users unique access-token.
     * @apiSuccessExample Success-Response:
{
	code: 1,
	time: 1456698548213,
	data: {
		list: [{
			_id: '56d374b30daaf268195201bb',
			name: 'user1',
			userid: 'userid1mW84z',
			password: '*****',
			organizationId: '56d374b30daaf268195201ba',
			created: 1456698547727,
			status: 1,
			__v: 0,
			tokenGeneratedAt: 1456698548170,
			token: '*****',
			departments: [],
			groups: [],
			onelineStatus: 0
		}, {
			_id: '56d374b30daaf268195201bc',
			name: 'user2',
			userid: 'userid2EqTJ7',
			password: '*****',
			organizationId: '56d374b30daaf268195201ba',
			created: 1456698547737,
			status: 1,
			__v: 0,
			tokenGeneratedAt: 1456698548166,
			token: '*****',
			departments: [],
			groups: [],
			onelineStatus: 0
		}, {
			_id: '56d374b30daaf268195201bd',
			name: 'user3',
			userid: 'userid3V2S36',
			password: '*****',
			organizationId: '56d374b30daaf268195201ba',
			created: 1456698547743,
			status: 1,
			__v: 0,
			tokenGeneratedAt: 1456698548167,
			token: '*****',
			departments: [],
			groups: [],
			onelineStatus: 0
		}, {
			_id: '56d374b30daaf268195201be',
			name: 'user4',
			userid: 'userid4qXXvb',
			password: '*****',
			organizationId: '56d374b30daaf268195201ba',
			created: 1456698547747,
			status: 1,
			__v: 0,
			tokenGeneratedAt: 1456698548170,
			token: '*****',
			departments: [],
			groups: [],
			onelineStatus: 0
		}],
		count: 4
	}
}
**/

    router.get('/',tokenChecker,function(request,response){
        
		async.waterfall([
			
			function(done){
				
				var result = {};
				
				SearchUserLogic.search(request.user,"",0,function(resultSearch,errorCode){
					
					result.list = resultSearch.list;
					result.count = resultSearch.count;
					
					done(null,result);

				},function(err){

					console.log("critical err",err);
					self.errorResponse(response,Const.httpCodeServerError);
					return;
				
				});
		
			},
			function(result,done){
				
				/*
				// add support user
				var userModel = UserModel.get();
				
				userModel.findOne({_id:Config.supportUserId},function(err,resultSearchAdmin){
					
					var admin = resultSearchAdmin;
					
					if(admin){
						
						console.log(admin);
						
					}
					
					done(null,result);
					
				});
				*/
				
				done(null,result);
				
			}
		],
		function(err,result){

			self.successResponse(response,Const.responsecodeSucceed, {
				list: result.list,
				count: result.count
			});
					
		});
        
    });
    
    router.get('/:page',tokenChecker,function(request,response){
        
        var page = request.params.page - 1;
        
 
		async.waterfall([
			
			function(done){
				
				var result = {};
				
				SearchUserLogic.search(request.user,"",page,function(resultSearch,errorCode){
					
					result.list = resultSearch.list;
					result.count = resultSearch.count;
					
					done(null,result);

				},function(err){

					console.log("critical err",err);
					self.errorResponse(response,Const.httpCodeServerError);
					return;
				
				});
		
			},
			function(result,done){
				
				if(page > 0){
					
					done(null,result);
					return;
					
				}
				
				if(request.user.permission == Const.userPermission.organizationAdmin){

					// add support user
					var userModel = UserModel.get();
					
					userModel.findOne({_id:Config.supportUserId},function(err,resultSearchAdmin){
						
						var admin = resultSearchAdmin;
						
						if(admin){
							
							result.list.push(admin);
							result.count++;

						}
						
						done(null,result);
						
					});
				
				} else {
					
					done(null,result);
					
				}

				
			}
		],
		function(err,result){

			self.successResponse(response,Const.responsecodeSucceed, {
				list: result.list,
				count: result.count
			});
					
		});
        
    });
   
    return router;

}

module["exports"] = new UserListController();
