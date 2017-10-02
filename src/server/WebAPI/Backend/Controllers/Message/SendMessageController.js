/** Called for /api/v2/message/send API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require(pathTop +"lib/consts");
var Config = require(pathTop +"lib/init");
var DatabaseManager = require(pathTop +'lib/DatabaseManager');
var Utils = require(pathTop +'lib/utils');

var HookModel = require( pathTop + 'Models/Hook');
var UserModel = require( pathTop + 'Models/User');

var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var SendMessageLogic = require(pathTop + "Logics/SendMessage");

var SendMessageController = function(){
}

_.extend(SendMessageController.prototype,BackendBase.prototype);

SendMessageController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {post} /api/v2/message/send Send Message
     * @apiName SendMessage
     * @apiGroup WebAPI
     * @apiDescription Returns messageobj
     * @apiHeader {String} access-token Users unique access-token.
     
     * @apiParam {String} roomID roomID
     * @apiParam {String} message message
     * @apiParam {String} type message type
     * @apiParam {String} file.file file( if eixsts)
     * @apiParam {String} file.thumb thumb ( if picture )
     * @apiSampleRequest 
{
  "file": {
    "file": {
      "size": "1504586",
      "name": "test.jpg",
      "mimeType": "image/jpeg",
      "id": "5730a5edf5c6e3123d09c85f"
    },
    "thumb": {
      "size": "33000",
      "name": "thumb_2014-06-03 17.23.39.jpg\"",
      "mimeType": "image/jpeg",
      "id": "5730a5eef5c6e3123d09c860"
    }
  },
  "roomID": "1-56ec126ca4718ef424641692-572b3fdd52ae03995757478e",
  "type": "2"
}

     * @apiSuccessExample Success-Response:
{
	"code": 1,
	"time": 1462805270534,
	"data": {
		"message": {
			"__v": 0,
			"user": "56ec127aa4718ef424641693",
			"userID": "56ec126ca4718ef424641692",
			"roomID": "1-56ec126ca4718ef424641692-572b3fdd52ae03995757478e",
			"message": "test",
			"type": 1,
			"created": 1462805270529,
			"_id": "5730a316cce6a28d3afd8eee",
			"seenBy": []
		}
	}
}

**/
    
    router.post('/',tokenChecker,function(request,response){

        request.body.encrypted = true;
        request.body.userID = request.user._id.toString();
        
        async.waterfall([(done) => {

            var result = {};

            SendMessageLogic.send(
                
                request.body,
                
                function(err){
                    
                    done(err,null);
                    
                },

                function(data){
                    
                    result.origMessageObj = data;
                    
                    done(null,result);
                    
                }
                
            )

        },
        (result,done) => {
            done(null,result)
        }
        ],
        function(err,result){

            if(err){
                self.successResponse(response,Const.responsecodeFailedToSendMessage,{
                });
            } else {
                self.successResponse(response,Const.responsecodeSucceed,{
                    message: result.origMessageObj
                });
            }
        });
            
    });
   
    return router;

}


module["exports"] = new SendMessageController();
