const _ = require('lodash');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const async = require('async');
const path = require('path');

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
                        .send(Const.errorMessage.queryParamsNotCorrect);

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
        let form = new formidable.IncomingForm();
        const uploadPathError = self.checkUploadPath();

        async.waterfall([
            (done) => {
                form.uploadDir = Config.uploadPath;
                form.on('fileBegin', (name, file) => {
                    file.path = path.dirname(file.path) + "/" + Utils.getRandomString();
                });
                form.onPart = (part) => {
                    if (part.filename) {
                        if (!uploadPathError) form.handlePart(part);
                    } else if (part.filename != "") {
                        form.handlePart(part);
                    }
                }
                form.parse(request, (err, fields, files) => {
                    const result = { avatar: files.avatar, fields: fields }
                    done(err, result);
                })
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
    router.get('/:roomId',checkAPIKey, (request,response) => {
        const roomId = request.params.roomId;        
        const query = self.checkQueries(request.query);

        // Check params
        if (!mongoose.Types.ObjectId.isValid(roomId))
            return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.roomidIsWrong);
        if (!query) 
            return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.queryParamsNotCorrect);
        
        RoomLogic.getDetails(roomId ,query.fields, (room, err) => {
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
    router.put('/:roomId', checkAPIKey, checkUserAdmin, (request,response) => {
        const roomId = request.params.roomId;
        let form = new formidable.IncomingForm();
        const uploadPathError = self.checkUploadPath();          
        
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
                form.uploadDir = Config.uploadPath;
                form.on('fileBegin', (name, file) => {
                    file.path = path.dirname(file.path) + "/" + Utils.getRandomString();
                });
                form.onPart = (part) => {
                    if (part.filename) {
                        if (!uploadPathError) form.handlePart(part);
                    } else if (part.filename != "") {
                        form.handlePart(part);
                    }
                }
                form.parse(request, (err, fields, files) => {
                    result = { avatar: files.avatar, fields: fields }
                    done(err, result);
                })
            },
            // Validate presense and max length
            (result, done) => {
                self.validateMaxLength(result.fields, (err) => {
                    done(err, result);
                });
            },
            // Validate the new name is duplicated, or not.
            (result, done) => {
                if (uploadPathError) 
                    return done(uploadPathError, result);
                self.validateDuplication(result.fields.name, request.user.organizationId, (err) => {
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
    router.delete('/:roomId',checkAPIKey, checkUserAdmin, (request,response) => {
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
                    if (!foundRoom) {
                        return done({
                            code: Const.httpCodeBadParameter,
                            message: Const.errorMessage.roomidIsWrong
                        }, null);
                    }
                    if (err) {
                        const e = { code: err.status, message: err.text };
                        return done(e, result);
                    }
                    done(null, { room: foundRoom })
                });
            },
        ],
        (err, result) => {
            if (!_.isEmpty(err))
                return response.status(err.code).send(err.message);
            
            RoomLogic.delete(result.room, request.user, (room, err) => {
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
                self.errorResponse(response, Const.httpCodeServerError);
                return;
            }

            self.successResponse(response, Const.responsecodeSucceed, {
                users: result.users 
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
