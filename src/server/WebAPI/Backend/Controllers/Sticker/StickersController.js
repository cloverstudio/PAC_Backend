/** Called for /api/v2/stickers/:OrganizationID API */

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
var StickerModel = require( pathTop + 'Models/Sticker');
var OrganizationModel = require( pathTop + 'Models/Organization');
var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var StickersController = function(){
}

_.extend(StickersController.prototype,BackendBase.prototype);

StickersController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v2/stickers Sticker List
     * @apiName StickerList
     * @apiGroup WebAPI
     * @apiDescription Returns list of stickers
     * @apiSuccessExample Success-Response:
{
	"code": 1,
	"time": 1458594799210,
	"data": {
		"stickers": [{
			"name": "sticker1",
			"list": [{
				"fullPic": "/api/v2/sticker/M7mlnDGKvZwbpTdtUYJfAQkx87Sqq2jk",
				"smallPic": "/api/v2/sticker/RQId55OV5rAA5PDSXehKkmfvu1yBVtfm"
			}, {
				"fullPic": "/api/v2/sticker/IAy3Fsm5Ldp0iUYpnhalFZE96bzCG89C",
				"smallPic": "/api/v2/sticker/y1tAUeqrSnHbLiEIxzOnY5L9ycX2pb4J"
			}, {
				"fullPic": "/api/v2/sticker/MT2ZS0yfcD4ANykJGmgZsCvbk4r3GavX",
				"smallPic": "/api/v2/sticker/eoVFhVw00wgV7tlZBD1qWCtCJltTyHI9"
			}],
			"mainTitlePic": "/api/v2/sticker/y1tAUeqrSnHbLiEIxzOnY5L9ycX2pb4J"
		}, {
			"name": "sticker2",
			"list": [{
				"fullPic": "/api/v2/sticker/crbsy6L64dMH2sqQ2Dwajowc7iVXd4S4",
				"smallPic": "/api/v2/sticker/bGIzNJ3618UmpKtFKM3HoYA43VM4afTQ"
			}, {
				"fullPic": "/api/v2/sticker/faSBTStGxeiSR8ojFXxbK9mZIiE4nFhO",
				"smallPic": "/api/v2/sticker/9A98VuyQavssHEFAY872efM9JHFqfm9L"
			}, {
				"fullPic": "/api/v2/sticker/eAmxxxQVuxWANxHnfs9vht0wqLJgX7na",
				"smallPic": "/api/v2/sticker/Yxv63CSDwHTK6lSOqdPMztQWePdxCt2j"
			}],
			"mainTitlePic": "/api/v2/sticker/bGIzNJ3618UmpKtFKM3HoYA43VM4afTQ"
		}]
	}
}

**/
    
    router.get('/:organizationId',tokenChecker,function(request,response){
        
        var model = StickerModel.get();
        var organizationModel = OrganizationModel.get();
        var organizationId = request.user.organizationId;
        
        async.waterfall([function(done){
            
            var result = {};
			
			organizationModel.findOne({
				_id:organizationId
			},function(err,findResult){
				
				if(!findResult){
					self.successResponse(response,Const.responsecodeStickersWrongOrganizationId);
					return;
				}
				
				result.organizationModel = findResult;
				
				done(err, result);
				
			});
			
			
        },
        function(result,done){
        
			var criteria = { 
                    $or: [
                        { organizationId: organizationId },
                        { organizationId: { $exists: false } }
                    ]
                };
                
            model.find(criteria).
            exec(function(err,findResult){
               	
               	result.list = findResult;
               	
                done(err, result);
                
            });
            
        }
        ],
        function(err,result){
            
            if(err){
                console.log("critical err",err);
                self.errorResponse(response,Const.httpCodeServerError);
                return;
            }
            
            // change array structure to be more general
            var newResult = _.map(result.list,function(row){
	        	
	        	var titleThumb = "";
	        	
	        	var list = _.map(row.pictures,function(picRow){
		        	
		        	if(picRow.main)
		        		titleThumb = '/api/v2/sticker/' + picRow.thumbnail.nameOnServer;
		        		
			        return {
			        	fullPic : '/api/v2/sticker/' + picRow.picture.nameOnServer,
			        	smallPic : '/api/v2/sticker/' + picRow.thumbnail.nameOnServer
		        	}
		        	
	        	});
	        	
	        	return {
		        	name: row.name,
		        	list: list,
		        	mainTitlePic : titleThumb
	        	}
	        	    
			});
            
            self.successResponse(response,Const.responsecodeSucceed,{
	            stickers: newResult
            });
            
        });
        
    });
   
    return router;

}

module["exports"] = new StickersController();
