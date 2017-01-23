/** Called for /api/v2/room/list/mine API */

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
var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var RoomListMineController = function(){
}

_.extend(RoomListMineController.prototype,BackendBase.prototype);

RoomListMineController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v2/room/list/mine List user's room
     * @apiName List user's room
     * @apiGroup WebAPI
     * @apiDescription Returns all rooms which caller user is owner
     * @apiHeader {String} access-token Users unique access-token.
     * @apiSuccessExample Success-Response:
{
	code: 1,
	time: 1458829974637,
	data: {
		rooms: [{
			_id: '56f3fa956994704ec1b7fba5',
			description: 'description',
			owner: '56f3fa946994704ec1b7fb9d',
			name: 'Room1Changeg',
			created: 1458829973564,
			__v: 0,
			modified: 1458829973909,
			avatar: {
				thumbnail: {
					originalName: 'max.jpg',
					size: 64914,
					mimeType: 'image/png',
					nameOnServer: '1quUqnJh2dfSzgaMXoSpMCaQguL4mMgO'
				},
				picture: {
					originalName: 'max.jpg',
					size: 64914,
					mimeType: 'image/png',
					nameOnServer: 'KCcOhqigP4tKYyZlB0IuCCvLZztg26fZ'
				}
			},
			users: ['56f3fa946994704ec1b7fb9d',
				'56f3fa946994704ec1b7fb9e',
				'56f3fa946994704ec1b7fb9f'
			]
		}]
	}
}

**/
    
    router.get('/',tokenChecker,function(request,response){
        
        var roomModel = RoomModel.get();
        
        async.waterfall([function(done){
            
            var result = {};
            
            roomModel.find({owner:request.user._id.toString()},function(err,list){
                result.list = list;
                done(err,result);
            });
        },
        function(result,done){
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
                rooms: result.list
            });
            
        });
        
    });
   
    return router;

}

module["exports"] = new RoomListMineController();
