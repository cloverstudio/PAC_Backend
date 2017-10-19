const _ = require('lodash');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const async = require('async');

const pathTop = "../../../";
const Const = require( pathTop + "lib/consts");
const Config = require( pathTop + "lib/init");
const Utils = require( pathTop + "lib/utils");
const checkAPIKey = require( pathTop + 'lib/authApiV3');
const APIBase = require('./APIBase');
const checkUserAdmin = require('../../../lib/authV3.js').checkUserAdmin;
const formidable = require('formidable');

const RoomModel = require(pathTop + 'Models/Room');
const UserModel = require(pathTop + 'Models/User');
const OrganizationModel = require(pathTop + 'Models/Organization');
const MessageListLogic = require( pathTop + "Logics/v3/MessageList");
const HistoryModel = require( pathTop + 'Models/History');

var SocketAPIHandler = require( pathTop + 'SocketAPI/SocketAPIHandler');

const RoomLogic = require( pathTop + "Logics/v3/Room");

const RoomsController = function(){};
_.extend(RoomsController.prototype, APIBase.prototype);

RoomsController.prototype.init = function(app){
        
    var self = this;

    /**
     * @api {get} /api/v3/rooms/ get room list
     **/
    router.get('/', checkAPIKey, (request,response) => {
        const query = self.checkQueries(request.query);
        if (!query) 
            return response.status(Const.httpCodeBadParameter)
                        .send(Const.errorMessage.offsetIsMinus);

        RoomLogic.search(request.user, query, (result, err) => {
            self.successResponse(response, Const.responsecodeSucceed, {
                rooms: result.list
            });
        }, (err) => {
            console.log("Critical Error", err);
            return self.errorResponse(response, Const.httpCodeServerError);
        });
    });


    /**
     * @api {post} /api/v3/rooms create a new room
     */
    router.post('/', checkAPIKey, (request, response) => {

        async.waterfall([
            (done) => {
                self.parseFormData(request, (err, result) => {
                    done(err, result);
                });
            },
            // Validate length
            (result, done) => {
                self.validateMaxLength(result.fields, (err) => {
                    done(err, result);
                });
            },
            // Validate the userid in users is correct format.
            (result, done) => {
                if (result.fields.users) {
                    const users = result.fields.users.split(",");
                    result.fields.users = _.map(users, (user) => {
                        return user.trim();
                    });
                    self.validateUserIdIsCorrect(result.fields.users, (err) => {
                        done(err, result);
                    });
                } else {
                    done(null, result);
                } 
            },
            // Validate the set users exist in database, or not.
            (result, done) => {       
                if (result.fields.users) {              
                    self.validateUsersPresence(result.fields.users, request.user.organizationId, (err) => {
                        done(err, result);  
                    });
                } else {
                    done(null, result);
                }
            }
        ],
        (err, result) => {
            if (!_.isEmpty(err))
                return response.status(err.code).send(err.message);

            RoomLogic.create(request.user, result.fields, result.avatar, (createdRoom, err) => {
                self.successResponse(response, Const.responsecodeSucceed, {
                    room: createdRoom
                });
            }, (err) => {
                console.log("Critical Error", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            }); 
        });
    });
    

    /**
     * @api {get} /api/v3/rooms/{roomId} get room details
     **/
    router.get('/:roomId', checkAPIKey, (request,response) => {
        const roomId = request.params.roomId;        
        const query = self.checkQueries(request.query);

        // Check params
        if (!mongoose.Types.ObjectId.isValid(roomId))
            return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.roomidIsWrong);
        if (!query) 
            return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.offsetIsMinus);
        
        RoomLogic.getDetails(roomId , query.fields, (room, err) => {
            self.successResponse(response, Const.responsecodeSucceed, {
                room: room
            }); 
        }, (err) => {
            console.log("Critical Error", err);
            return self.errorResponse(response, Const.httpCodeServerError);
        });
    });


    /**
     * @api {put} /api/v3/rooms/{roomId} edit room details
     **/
    router.put('/:roomId', checkAPIKey, (request,response) => {
        const roomId = request.params.roomId;
        
        async.waterfall([
            // Validate the roomId is handleable by mongoose
            (done) => {
                if (!mongoose.Types.ObjectId.isValid(roomId)) {
                    return done({
                        code: Const.httpCodeBadParameter,
                        message: Const.errorMessage.roomidIsWrong
                    }, null);
                }
                done(null, null);
            },
            (result, done) => {
                self.parseFormData(request, (err, result) => {
                    done(err, result);
                });
            },
            // Validate presense and max length
            (result, done) => {
                self.validateMaxLength(result.fields, (err) => {
                    done(err, result);
                });
            },
            // Validate files
            (result, done) => {
                if (result.file) {
                    if(file.type.indexOf("jpeg") == -1 && file.type.indexOf("gif") == -1 && file.type.indexOf("png") == -1){
                        return done({
                            code: Const.responsecodeUpdateRoomWrongFile,
                            message: Const.errorMessage.wrongFile 
                        }, null);
                    } 
                } else {
                    done(null, result);
                }
            }
        ],
        (err, result) => {
            if (!_.isEmpty(err))
                return response.status(err.code).send(err.message);

            RoomLogic.update(roomId, request.user, result.fields, result.avatar, (updated, err) => {
                self.successResponse(response, Const.responsecodeSucceed); 
            }, (err) => {
                console.log("Critical Error", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            });
        });
    });


    /**
     * @api {delete} /api/v3/rooms/{roomId} delete room details
     **/
    router.delete('/:roomId',checkAPIKey, (request,response) => {
        const roomId = request.params.roomId;        
        // Check params
        async.waterfall([
            (done) => {
                if (!mongoose.Types.ObjectId.isValid(roomId)) {
                    done({
                        code: Const.httpCodeBadParameter,
                        message: Const.errorMessage.roomidIsWrong
                    }, null);
                } else {
                    done(null, null);
                }
            },
            // get room which should be deleted
            (result, done) => {
                const roomModel = RoomModel.get();
                roomModel.findOne({_id: roomId}, (err, foundRoom) => {
                    if (err || !foundRoom) {
                        return done({
                            code: Const.httpCodeBadParameter,
                            message: Const.errorMessage.roomNotExist
                        }, null);
                    }
                    done(null, foundRoom)
                });
            },
            // Validate that loginUser is not owner of the room
            (room, done) => {
                if (request.user._id != room.owner.toString()) {
                    return done({
                        code: Const.httpCodeForbidden,
                        message: Const.errorMessage.cannotDeleteRoom
                    }, null);
                } else {
                    done(null, room);
                }
            }
        ],
        (err, room) => {
            if (!_.isEmpty(err))
                return response.status(err.code).send(err.message);
            
            RoomLogic.delete(room, request.user, (room, err) => {
                self.successResponse(response, Const.responsecodeSucceed); 
            }, (err) => {
                console.log("Critical Error", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            });
        })
    });


    /**
     * @api {get} /rooms/{roomId}/users/ Get user list of room
     **/
    router.get('/:roomId/users',checkAPIKey, (request,response) => {

        const userModel = UserModel.get();
        const roomId = request.params.roomId;        
        const q = self.checkQueries(request.query);

        // Check params
        if (!mongoose.Types.ObjectId.isValid(roomId))
            return response.status(Const.httpCodeBadParameter).send("Bad Parameter");
        
        async.waterfall([
            (done) => {

                const result = {};

                RoomLogic.getDetails(roomId ,null, (room, err) => {

                    if(!room){
                        done({
                            code: Const.httpCodeBadParameter
                        },null);

                        return;
                    }

                    result.roomDetail = room;
                    done(null,result);

                }, (err) => {
                    console.log("Critical Error", err);
                    done(err,result)
                });

            },
            (result,done) => {

                // split if paging exists
                let offset = 0;
                let limit = result.roomDetail.users.length;

                if(q.offset) offset = parseInt(q.offset);
                if(q.limit) limit = parseInt(q.limit);

                const userIdList = result.roomDetail.users.slice(offset,offset + limit);
                result.userIdList = userIdList;

                done(null,result)
            },
            (result,done) => {

                // get users
                userModel.find({_id:{$in:result.userIdList}},
                UserModel.defaultResponseFields,

                (err,findResult) => {
                    
                    result.users = Utils.ApiV3StyleId(findResult);

                    done(err,result);

                });

            }
        ],
        (err,result) => {
    
            if(err){

                if(err.code && err.code == Const.httpCodeBadParameter)
                    return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.roomidIsWrong);

                self.errorResponse(response, Const.httpCodeServerError);
                return;
            }

            self.successResponse(response, Const.responsecodeSucceed, {
                users: result.users 
            }); 

        });
        
    });

    /**
     * @api {post} /rooms/{roomId}/users/ Invite user to room
     **/
    router.post('/:roomId/users',checkAPIKey, (request,response) => {

        const userModel = UserModel.get();
        const roomId = request.params.roomId;        
        const userIds = request.body.users;
        const q = self.checkQueries(request.query);

        // Check params
        if (!mongoose.Types.ObjectId.isValid(roomId))
            return response.status(Const.httpCodeBadParameter).send("Bad Parameter");
        
        if (!userIds || !Array.isArray(userIds))
            return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.wrongUserIds);

        async.waterfall([
            (done) => {

                const result = {};

                RoomLogic.getDetails(roomId ,null, (room, err) => {

                    if(!room){
                        done({
                            code: Const.httpCodeBadParameter
                        },null);

                        return;
                    }

                    result.roomDetail = room;
                    done(null,result);

                }, (err) => {
                    console.log("Critical Error", err);
                    done(err,result)
                });

            },
            (result,done) => {

                const newUsers = _.uniq(result.roomDetail.users.concat(userIds));
                result.newUsers = newUsers;

                done(null,result);


            },
            (result,done) => {

                const roomModel = RoomModel.get();

                roomModel.update({ _id: roomId }, {
                    users:result.newUsers
                }, (err, updated) => {

                    if(!err)
                        result.roomDetail.users = result.newUsers;

                    done(err, result);

                });

            }
        ],
        (err,result) => {
    
            if(err){

                if(err.code && err.code == Const.httpCodeBadParameter)
                    return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.roomidIsWrong);

                self.errorResponse(response, Const.httpCodeServerError);
                return;
            }

            self.successResponse(response, Const.responsecodeSucceed, {
                room: result.roomDetail
            }); 

        });

    });
    
    /**
     * @api {delete} /rooms/{roomId}/users/ Kick user out from room
     **/
    router.delete('/:roomId/users',checkAPIKey, (request,response) => {

        const userModel = UserModel.get();
        const roomId = request.params.roomId;        
        const userIds = request.body.users;
        const q = self.checkQueries(request.query);

        // Check params
        if (!mongoose.Types.ObjectId.isValid(roomId))
            return response.status(Const.httpCodeBadParameter).send("Bad Parameter");
        
        if (!userIds || !Array.isArray(userIds))
            return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.wrongUserIds);
        
        async.waterfall([
            (done) => {

                const result = {};

                RoomLogic.getDetails(roomId ,null, (room, err) => {

                    if(!room){
                        done({
                            code: Const.httpCodeBadParameter
                        },null);

                        return;
                    }

                    result.roomDetail = room;
                    done(null,result);

                }, (err) => {
                    console.log("Critical Error", err);
                    done(err,result)
                });

            },
            (result,done) => {

                const newUsers = result.roomDetail.users.filter((userId) => {

                    return userIds.indexOf(userId) == -1;

                });

                result.newUsers = newUsers;

                done(null,result);


            },
            (result,done) => {

                // delete from history
                var historyModel = HistoryModel.get();

                userIds.forEach((userId) => {

                    // stop sending notification
                    SocketAPIHandler.leaveFrom(userId,Const.chatTypeRoom,roomId);
                    
                    historyModel.remove({ 
                        chatId: roomId,
                        userId: userId
                    }, function(err, deleteResult) {
    
                        SocketAPIHandler.emitToUser(
                            userId,
                            'delete_room',
                            {conversation:result.roomDetail}
                        );

                        done(err,result);
                        
                    });

                });

            },
            (result,done) => {
                
                const roomModel = RoomModel.get();

                roomModel.update({ _id: roomId }, {
                    users:result.newUsers
                }, (err, updated) => {

                    if(!err)
                        result.roomDetail.users = result.newUsers;

                    done(err, result);

                });

            }
        ],
        (err,result) => {
    
            if(err){

                if(err.code && err.code == Const.httpCodeBadParameter)
                    return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.roomidIsWrong);

                self.errorResponse(response, Const.httpCodeServerError);
                return;
            }

            self.successResponse(response, Const.responsecodeSucceed, {
                room: result.roomDetail
            }); 

        });
        

    });
    
    /**
     * @api {get} /rooms/{roomId}/messages/ Get list of messages sent to room
     **/
    router.get('/:roomId/messages',checkAPIKey, (request,response) => {

        const userModel = UserModel.get();
        const roomId = request.params.roomId;        
        const q = self.checkQueries(request.query);

        // Check params
        if (!mongoose.Types.ObjectId.isValid(roomId))
            return response.status(Const.httpCodeBadParameter).send("Bad Parameter");
        
        async.waterfall([
            (done) => {

                const result = {};

                RoomLogic.getDetails(roomId ,null, (room, err) => {

                    if(!room){
                        done({
                            code: Const.httpCodeBadParameter
                        },null);

                        return;
                    }

                    result.roomDetail = room;
                    done(null,result);

                }, (err) => {

                    console.log("Critical Error", err);
                    done(err,result)
                });

            },
            (result,done) => {

                // find messsages
                MessageListLogic.get(request.user._id
                    ,Const.chatTypeRoom + "-" + result.roomDetail.id
                    ,q
                    ,(messages) => {

                    result.messages = messages;
                    done(null,result);

            },(err) => {
                done(err,result);
            });


            },
            (result,done) => {
                
                done(null,result);

            }
        ],
        (err,result) => {
    
            if(err){

                if(err.code && err.code == Const.httpCodeBadParameter)
                    return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.roomidIsWrong);

                self.errorResponse(response, Const.httpCodeServerError);

                return;

            }

            self.successResponse(response, Const.responsecodeSucceed, {
                messages: result.messages
            }); 

        });
        

    });

    /**
     * @api {post} /rooms/{roomId}/leave Get user
     **/
    router.post('/leave', checkAPIKey, (request, response) => {
        const roomId = request.body.roomId;
        const roomModel = RoomModel.get();
        
        async.waterfall([
            (done) => {
                if (!mongoose.Types.ObjectId.isValid(roomId)) {
                    done({
                        code: Const.httpCodeBadParameter,
                        message: Const.errorMessage.roomidIsWrong
                    }, null);
                } else {
                    done(null, null);
                }
            },
            (result, done) => {
                roomModel.findOne({_id: roomId}, (err, room) => {
                    if (err || !room) {
                        return done({
                            code: Const.httpCodeBadParameter,
                            message: Const.errorMessage.roomNotExist
                        });
                    } else {
                        done(err, room);                        
                    }
                });
            },
            // Validate that loginUser is not owner ot the room
            (room, done) => {
                if (request.user._id == room.owner.toString()) {
                    return done({
                        code: Const.httpCodeForbidden,
                        message: Const.errorMessage.ownerCannotLeaveRoom
                    }, null);
                } else {
                    done(null, room);
                }
            },
            // Validate user exists in room, or not
            (room, done) => {
                const found = _.find(room.users, (userId) => {
                    return userId == request.user._id;
                });
                if (found) {
                    done(null, room);
                } else {
                    done({
                        code: Const.httpCodeBadParameter, 
                        message: Const.errorMessage.userNotExistInRoom
                    }, null);
                }
            }
        ], 
        (err, room) => {
            if (!_.isEmpty(err))
                return response.status(err.code).send(err.message);
        
            RoomLogic.leave(request.user, room, (room) => {
                self.successResponse(response, Const.responsecodeSucceed); 
            }, (err) => {
                console.log("Critical Error", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            });
        });
    });

    return router;
}

/**
 * The following is the validation functions
 */

RoomsController.prototype.validateMaxLength = (values, callback) => {
    let error = {};
    if (values.name && values.name.length > Const.nameMaxLength) {
        error.message = Const.errorMessage.nameTooLarge;
    } else if (values.description && values.description.length > Const.descriptionMaxLength) {
        error.message = Const.errorMessage.descriptionTooLarge;
    }

    if (error.message) {
        error.code = Const.httpCodeBadParameter;
    } else {
        error = null;
    }
    callback(error);
}

RoomsController.prototype.validateUserIdIsCorrect = (users, callback) => {
    let err = null;
    _.each(users, (userid) => {
        if (!mongoose.Types.ObjectId.isValid(userid)) {
            err = {
                code: Const.httpCodeBadParameter,
                message: Const.errorMessage.includeUsersNotExist
            };
        }
    });
    callback(err);   
}

RoomsController.prototype.validateUsersPresence = (users, organizationId, callback) => {
    const userModel = UserModel.get();
    const conditions = {
        $and: [
            {organizationId: organizationId},
            { _id: { $in: users } }
        ]
    }
    userModel.find(conditions,{_id:1}, (err, foundUsers) => {
        if (err) {
            return callback({
                code: Const.httpCodeBadParameter,
                message: err.message
            });
        }
        if (users.length!==foundUsers.length) {
            return callback({
                code: Const.httpCodeBadParameter,
                message: Const.errorMessage.includeUsersNotExist
            }); 
        }
        _.each(foundUsers, (user) => {
            if(!_.includes(users, user._id.toString())) {
                return callback({
                    code: Const.httpCodeBadParameter,
                    message: Const.errorMessage.includeUsersNotExistInOrganiation
                });   
            }
        });
        callback(null);                                                            
    }); 
}

module["exports"] = new RoomsController();
