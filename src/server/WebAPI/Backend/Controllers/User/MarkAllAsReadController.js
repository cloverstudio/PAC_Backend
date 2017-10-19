/** Called for /api/v2/user/history/markall  API */

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
var HistoryModel = require( pathTop + 'Models/History');

var BackendBase = require('../BackendBase');

var MarkAllAsReadController = function(){
}

_.extend(MarkAllAsReadController.prototype,BackendBase.prototype);

MarkAllAsReadController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v2/user/history/markall MarkAll
     * @apiName MarkAll
     * @apiGroup WebAPI
     * @apiDescription Mark all as read
     * @apiHeader {String} access-token Users unique access-token.
     * @apiParam {String} chatId
     * @apiParam {String} chatType
     * @apiSuccessExample Success-Response:
{}

**/
    
    router.post('/',tokenChecker,function(request,response){
        
        async.waterfall([function(done){
            
            var result = {};
            
            var historyModel = HistoryModel.get();
            
            historyModel.update(
                { 
                    userId: request.user._id.toString(),
                    unreadCount: {$gt:0}
                }, 
                {       
                    unreadCount: 0,
                    lastUpdateUnreadCount: Utils.now()
                }, 
                { multi: true }, 
            function(err, updateResult) {

                done(err, result);
            
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
            
            self.successResponse(response,Const.responsecodeSucceed,result);
            
        });
        
    });
   
    return router;

}

module["exports"] = new MarkAllAsReadController();
