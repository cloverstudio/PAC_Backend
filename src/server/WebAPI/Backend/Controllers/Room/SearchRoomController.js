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

var SearchRoomController = function(){
}

_.extend(SearchRoomController.prototype,BackendBase.prototype);

SearchRoomController.prototype.init = function(app){
    
    var self = this;

   /**
     * @api {get} /api/v2/room/search/:page?keyword=keyword Search Room
     * @apiName Search Room
     * @apiGroup WebAPI
     * @apiDescription Returns rooms matches to the keyword
     * @apiHeader {String} access-token Users unique access-token.
     * @apiSuccessExample Success-Response:
    {
        "code": 1,
        "time": 1458048275869,
        "data": {
            "list": [
                {
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
                }
            ],
            "count": 1
        }
    }

**/
    
    router.get('/:page', tokenChecker, (request,response) => {
        
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
            
        }
        ],
        function(err,result){
            
            if(err){
                console.log("critical err",err);
                self.errorResponse(response,Const.httpCodeServerError);
                return;
            }
            
            self.successResponse(response,Const.responsecodeSucceed,{
                list : result.rooms,
                count : result.count
            });
            
        });
        
    });
   
    return router;

}

module["exports"] = new SearchRoomController();
