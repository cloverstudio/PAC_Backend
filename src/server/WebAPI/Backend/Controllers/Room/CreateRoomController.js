/** Called for /api/v2/room/new API */

var express = require('express');
var router = express.Router();
var sha1 = require('sha1');
var bodyParser = require("body-parser");
var _ = require('lodash');
var async = require('async');
var validator = require('validator');
var fs = require('fs-extra');
var formidable = require('formidable');
var easyimg = require('easyimage');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var Utils = require( pathTop + 'lib/utils');
var UserModel = require( pathTop + 'Models/User');
var RoomModel = require( pathTop + 'Models/Room');
var OrganizationModel = require( pathTop + 'Models/Organization');
var tokenChecker = require( pathTop + 'lib/authApi');
var UpdateHistoryLogic = require( pathTop + 'Logics/UpdateHistory');
var SocketAPIHandler = require( pathTop + 'SocketAPI/SocketAPIHandler');

var BackendBase = require('../BackendBase');

var CreateRoomController = function(){};
_.extend(CreateRoomController.prototype,BackendBase.prototype);

CreateRoomController.prototype.init = function(app){

    var self = this;
    

   /**
     * @api {post} /api/v2/room/new New Room
     * @apiName Create New room
     * @apiGroup WebAPI
     * @apiHeader {String} access-token Users unique access-token.
     * @apiDescription Create new conversation
     * @apiParam {name} name of room.
     * @apiParam {string} description Description
     * @apiParam {file} file file
     * @apiParam {string} users comma separated user ids.
     * @apiParamExample {json} Request-Example:
        {
            name : "name of conversation ", // if empty generates by users
            useOld: false, // put true if use old conversation for same users
            users: [
                "563a0cc46cb168c8e9c4071d",
                "563a0cc46cb168c8e9c4071a",
                "563a0cc46cb168c8e9c4071b"
            ]
        }
     * @apiSuccessExample Success-Response:
{
	code: 1,
	time: 1455785008104,
	data: {
		room: {
			__v: 0,
			owner: '56c5842faea1bfac4a657bbd',
			name: 'room1',
			created: 1455785008046,
			_id: '56c58430aea1bfac4a657bc1',
			avatar: {
				thumbnail: {
					originalName: 'dfhSvtAQyCGMALxs4AZXzuZVOrXSmbfg',
					size: 136825,
					mimeType: 'image/png',
					nameOnServer: 'dfhSvtAQyCGMALxs4AZXzuZVOrXSmbfg'
				},
				picture: {
					originalName: 'dfhSvtAQyCGMALxs4AZXzuZVOrXSmbfg',
					size: 136825,
					mimeType: 'image/png',
					nameOnServer: 'dfhSvtAQyCGMALxs4AZXzuZVOrXSmbfg'
				}
			},
			users: ['56c5842faea1bfac4a657bbd',
				'56c5842faea1bfac4a657bbe',
				'56c5842faea1bfac4a657bbf',
				'56c5842faea1bfac4a657bc0'
			]
		}
	}
}
    */
    
    router.post('/',tokenChecker,function(request,response){
        
        var form = new formidable.IncomingForm();
        var errCode = null;
        
        async.waterfall([function(done){
                
                var result = {};

                form.parse(request, function(err, fields, files) {

                    result.requestParams = {file:files.file,fields:fields};
                    
                    done(null,result);
                    
                });
                
            },
            function(result, done) {

                var userModel = UserModel.get();

                // get all users by organizationId           
                userModel.find({ organizationId: request.user.organizationId }, { _id: 1 }, (err, findResult) => {
                    
                    if (err) errCode = Const.httpCodeServerError;

                    result.users = findResult;
                    done(errCode, result);
                    
                });

            },
            function(result, done) {
                
                var organizationModel = OrganizationModel.get();

                // get max room number from organization       
                organizationModel.findOne({ _id: request.user.organizationId }, { maxRoomNumber: 1 }, (err, findResult) => {

                    if (err) errCode = Const.httpCodeServerError;

                    result.maxRoomNumber = findResult.maxRoomNumber;
                    done(errCode, result);
                    
                });

            },
            function(result, done) {

                var roomModel = RoomModel.get();
                
                roomModel.count({ owner: { $in: _.pluck(result.users, "_id") } }, (err, numberOfRooms) => {
                    
                    if (err) errCode = Const.httpCodeServerError;

                    if (numberOfRooms >= result.maxRoomNumber) { 
                        
                        done(Const.responsecodeMaxRoomNumber, result);
                        
                    } else {
                        
                        done(errCode, result);
                        
                    }
                    
                });
            },
            function(result,done){
                
                var useOld = false;
                
                if(result.requestParams.fields.useOld == 1)
                    useOld = true;

                if(result.requestParams.fields.useOld === 1)
                    useOld = true;
                
                var users = result.requestParams.fields.users;
                var usersAry = [];
                if(users){
                    usersAry = users.split(',');
                }
                
                self.logic(
                        request.user._id,
                        usersAry,
                        useOld,
                        result.requestParams.fields.name,
                        result.requestParams.fields.description,
                        result.requestParams.file,
                    function(resultRoom){
                                        
                    if(!resultRoom){
                        self.errorResponse(response,Const.httpCodeServerError);
                            
                    }else{
                        
                            //result.users = resultUsers;
                            
                            UpdateHistoryLogic.newRoom(result);
                            result.room = resultRoom;

                            done(null,result);

                            /*
                            // send socket
                            _.forEach(request.body.users,function(userId){
                                
                                SocketAPIHandler.emitToUser(
                                    userId,
                                    Const.emitCommandNewConversation,
                                    {conversation:result}
                                );
                                    
                            });

                            SocketAPIHandler.emitToUser(
                                request.user._id,
                                Const.emitCommandNewConversation,
                                {conversation:result}
                            );
                            
                            */
                            
                    }
                    
                });

            },
            function(result,done){

                // join to room
                var users = result.requestParams.fields.users;
                var usersAry = [];
                if(users){
                    usersAry = users.split(',');
                }

                usersAry.push(request.user._id);
                
                usersAry.forEach((userId) => {

                    SocketAPIHandler.joinTo(userId,Const.chatTypeRoom,result.room._id.toString());

                });
                            
                done(null,result);

            }
        ],
        function(err,result){
        
            if (err == Const.httpCodeServerError) {

                console.log("critical err", err);
                self.errorResponse(response, err);

            } else {

                self.successResponse(response,Const.responsecodeSucceed,{
                    room: result.room
                });
                            

            }
            
        });
    });
    
    return router;

}

CreateRoomController.prototype.logic = function(ownerUserId,users,useOld,defaultName,description,picture,callBack){
    
    var self = this;
    
    var roomModel = RoomModel.get();
	 
    // save to database
    var model = new roomModel({
        owner : ownerUserId,
        users : [],
        name  : "",
        created : Utils.now(),
        avatar : {
            picture : {},
            thumbnail : {}
        }
    });

    try{
                
        model.users.push(ownerUserId.toString());
        
    } catch(e){
                
        // mostly when user id is invalid
        callBack(false);
        return;
        
    }

    var result = {};

    users = _.filter(users,function(row){
        
        return !_.isEmpty(row);
         
    });
    
    async.waterfall([
        
        function (done){
        
            // search users by id
            var userModel = UserModel.get();
            
            userModel.find({
            
                _id:{$in:users},
                
            },function(err,resultUsers){
                
                _.forEach(resultUsers,function(resultUser){
                     
                     model.users.push(resultUser._id.toString());
                                          
                });              

                model.users = _.uniq(model.users);
                  
                // ignore cast error
                done(null,result);

            });        
              
        },
        function (result,done) {

            if(_.isEmpty(defaultName)){

                self.generateConversationName(ownerUserId.toString(),model.users,function(theName){
    
                    model.name = theName;
    
                    done(null,result);
    
                });
                
            } else {
                
                model.name = defaultName;

                done(null,result);
                
            }


        },
        
        function (result,done){
	        
            if(!picture){
                
                done(null,result);
            
            }else {
                
                self.setAvatar(picture,function(avatarData){
                    
                    if(avatarData){
                        model.avatar.thumbnail = avatarData.thumbnail;
                        model.avatar.picture = avatarData.picture;                        
                    }

                    done(null,result);

                });

            }
            
        },
        
        function (result,done){

            if(description){
            
                model.description = description;  
                
            }
                
            model.save(function(err,conversationModelResult){
                done(err,conversationModelResult.toObject())
            });

        }

    ],
        function (err, result) {
            

            if(err){
                console.log(err);
                callBack(false);
                return;
            }
            
            callBack(model.toObject());

    });
}


CreateRoomController.prototype.generateConversationName = function(ownwerUserId,userIds,callBack){

    var theName = "";

    UserModel.getUsersById([ownwerUserId],function(users){
        
        var counter = 0;
        var user = users[0];

        if(user){
            if(callBack)
                callBack(Utils.shorten(user.name + "'s New Room"));
        }else{
            if(callBack)
                callBack("New Room");
        }

    });

}

module["exports"] = new CreateRoomController();
