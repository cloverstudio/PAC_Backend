/** Called for /api/v2/search/all/:page?keyword=keyword API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var Const = require("../../../../lib/consts");
var Config = require("../../../../lib/init");
var Utils = require("../../../../lib/utils");
var tokenChecker = require("../../../../lib/authApi");
var SearchUserLogic = require("../../../../Logics/SearchUser");
var SearchGroupLogic = require("../../../../Logics/SearchGroup");
var SearchRoomLogic = require("../../../../Logics/SearchRoom");
var HistoryModel = require('../../../../Models/History');

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
        
        var model = HistoryModel.get();
        var user = request.user;

        async.waterfall([

            (done) => {

                // get history 
                model.find({ 
                    userId: user._id.toString(),
                    chatType: Const.chatTypeRoom
                }, (err, findResult) => {
                    
                    if (err)
                        return done(err);
                                                
                    done(null, { roomHistory: findResult });
                                    
                });
            
            },
            (result, done) => {
            
                SearchRoomLogic.search(request.user,keyword,page,function(data){
                    
                    result.rooms = data.list.map((item) => {
                        item.type = Const.chatTypeRoom;

                        var lastUpdate = _.map(_.filter(result.roomHistory, { chatId: item._id.toString() }), "lastUpdate")[0];                    
                        item.lastUpdate = !lastUpdate ? 0 : lastUpdate;

                        return item;
                    });
                    
                    result.rooms = _.sortByOrder(result.rooms, [ 'lastUpdate' ], [ 'desc' ]);
                
                    result.count = data.count;
                    
                    done(null,result)
                    
                },function(err){
                    done(err,result)
                });
            
            }
        ],
        (err, result) => {
            
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
