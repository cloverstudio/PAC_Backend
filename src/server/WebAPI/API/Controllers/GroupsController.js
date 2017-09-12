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

const GroupModel = require(pathTop + 'Models/Group');
const UserModel = require(pathTop + 'Models/User');  

const GroupLogic = require( pathTop + "Logics/v3/Group");
const MessageListLogic = require( pathTop + "Logics/v3/MessageList");

const GroupsController = function(){};
_.extend(GroupsController.prototype, APIBase.prototype);

GroupsController.prototype.init = function(app){
        
    var self = this;

    /**
     * @api {get} /api/v3/groups/ get group list
     **/
    router.get('/',checkAPIKey, (request,response) => {
        const query = self.checkQueries(request.query);
        if (!query) 
            return response.status(Const.httpCodeBadParameter)
                        .send(Const.errorMessage.queryParamsNotCorrect);

        GroupLogic.search(request.user, query, (result, err) => {
            self.successResponse(response, Const.responsecodeSucceed, {
                groups: result.list
            }); 
        }, (err) => {
            console.log("Critical Error", err);
            return self.errorResponse(response, Const.httpCodeServerError);
        });
    });


    /**
     * @api {post} /api/v3/groups create a new group
     */
    router.post('/', checkAPIKey, checkUserAdmin, (request, response) => {
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
            // Validate presence
            (result, done) => {
                self.validatePresence(result.fields, (err) => {
                    done(err, result);
                });
            },
            // Validate length
            (result, done) => {
                self.validateMaxLength(result.fields, (err) => {
                    done(err, result);
                });
            },
            //Validate the new name is duplicated, or not.
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

            GroupLogic.create(request.user, result.fields, result.avatar, (createdGroup, err) => {
                self.successResponse(response, Const.responsecodeSucceed, {
                    group: createdGroup
                });
            }, (err) => {
                console.log("Critical Error", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            }); 
        });
    });
    

    /**
     * @api {get} /api/v3/groups/{groupId} get group details
     **/
    router.get('/:groupId',checkAPIKey, (request,response) => {
        const groupId = request.params.groupId;        
        const query = self.checkQueries(request.query);

        // Check params
        if (!mongoose.Types.ObjectId.isValid(groupId))
            return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.groupidIsWrong);
        if (!query) 
            return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.queryParamsNotCorrect);
        
        GroupLogic.getDetails(groupId ,query.fields, (group, err) => {
            self.successResponse(response, Const.responsecodeSucceed, {
                group: group
            }); 
        }, (err) => {
            console.log("Critical Error", err);
            return self.errorResponse(response, Const.httpCodeServerError);
        });
    });


    /**
     * @api {put} /api/v3/groups/{groupId} edit group details
     **/
    router.put('/:groupId', checkAPIKey, checkUserAdmin, (request,response) => {
        const groupId = request.params.groupId;
        let form = new formidable.IncomingForm();
        const uploadPathError = self.checkUploadPath();          
        
        async.waterfall([
            // Validate the groupId is handleable by mongoose
            (done) => {
                if (!mongoose.Types.ObjectId.isValid(groupId)) {
                    return done({
                        code: Const.httpCodeBadParameter,
                        message: Const.errorMessage.groupidIsWrong
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

            GroupLogic.update(groupId, request.user, result.fields, result.avatar, (updated, err) => {
                self.successResponse(response, Const.responsecodeSucceed); 
            }, (err) => {
                console.log("Critical Error", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            });
        });
    });


    /**
     * @api {delete} /api/v3/groups/{groupId} delete group details
     **/
    router.delete('/:groupId',checkAPIKey, checkUserAdmin, (request,response) => {
        const groupId = request.params.groupId;        
        // Check params
        async.waterfall([
            (done) => {
                if (!mongoose.Types.ObjectId.isValid(groupId)) {
                    done({
                        code: Const.httpCodeBadParameter,
                        message: Const.errorMessage.groupidIsWrong
                    }, null);
                } else {
                    done(null, null);
                }
            },
            // get group which should be deleted
            (result, done) => {
                const groupModel = GroupModel.get();
                groupModel.findOne({_id: groupId}, (err, foundGroup) => {
                    if (!foundGroup) {
                        return done({
                            code: Const.httpCodeBadParameter,
                            message: Const.errorMessage.groupidIsWrong
                        }, null);
                    }
                    if (err) {
                        const e = { code: err.status, message: err.text };
                        return done(e, result);
                    }
                    done(null, { group: foundGroup })
                });
            },
        ],
        (err, result) => {
            if (!_.isEmpty(err))
                return response.status(err.code).send(err.message);
            
            GroupLogic.delete(result.group, request.user, (group, err) => {
                self.successResponse(response, Const.responsecodeSucceed); 
            }, (err) => {
                console.log("Critical Error", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            });
        })
    });


    /**
     * @api {get} /groups/{groupId}/users/ Get user list of group
     **/
    router.get('/:groupId/users',checkAPIKey, (request,response) => {
        const userModel = UserModel.get();
        const groupId = request.params.groupId;        
        const q = self.checkQueries(request.query);

        // Check params
        if (!mongoose.Types.ObjectId.isValid(groupId))
            return response.status(Const.httpCodeBadParameter).send("Bad Parameter");
        
        async.waterfall([
            (done) => {

                const result = {};

                GroupLogic.getDetails(groupId ,null, (group, err) => {

                    if(!group){
                        done({
                            code: Const.errorMessage.groupidIsWrong
                        },null);

                        return;
                    }

                    result.groupDetail = group;
                    done(null,result);

                }, (err) => {
                    console.log("Critical Error", err);
                    done(err,result)
                });

            },
            (result,done) => {

                // split if paging exists
                let offset = 0;
                let limit = result.groupDetail.users.length;

                if(q.offset) offset = parseInt(q.offset);
                if(q.limit) limit = parseInt(q.limit);

                const userIdList = result.groupDetail.users.slice(offset,offset + limit);
                result.userIdList = userIdList;

                done(null,result);

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

                if(err.code && err.code == Const.errorMessage.groupidIsWrong)
                    return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.groupidIsWrong);

                self.errorResponse(response, Const.httpCodeServerError);
                return;
            }

            self.successResponse(response, Const.responsecodeSucceed, {
                users: result.users 
            }); 

        });

    });

    /**
     * @api {post} /groups/{groupId}/users/ Invite users to group
     **/
    router.post('/:groupId/users',checkAPIKey, checkUserAdmin,(request,response) => {

        const groupId = request.params.groupId;  
        const userIds = request.body.users;
        const groupModel = GroupModel.get();

        // Check params 
        if (!mongoose.Types.ObjectId.isValid(groupId))
            return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.groupidIsWrong);

        if (!userIds || !Array.isArray(userIds))
            return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.wrongUserIds);

        async.waterfall([
            (done) => {

                const result = {};

                GroupLogic.getDetails(groupId ,null, (group, err) => {

                    if(!group){
                        done({
                            code: Const.errorMessage.groupidIsWrong
                        },null);

                        return;
                    }

                    result.groupDetail = group;
                    done(null,result);

                }, (err) => {
                    console.log("Critical Error", err);
                    done(err,result)
                });

            },
            (result,done) => {

                const newUsers = _.uniq(result.groupDetail.users.concat(userIds));
                result.newUsers = newUsers;

                done(null,result);

            },
            (result,done) => {

                groupModel.update({ _id: groupId }, {
                    users:result.newUsers
                }, (err, updated) => {

                    if(!err)
                        result.groupDetail.users = result.newUsers;

                    done(err, result);

                });

            }
        ],
        (err,result) => {

            if(err){

                if(err.code && err.code == Const.errorMessage.groupidIsWrong)
                    return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.groupidIsWrong);

                self.errorResponse(response, Const.httpCodeServerError);
                return;
            }

            self.successResponse(response, Const.responsecodeSucceed, {
                group:result.groupDetail
            }); 

        });

    });

    /**
     * @api {delete} /groups/{groupId}/users/ Kick user out from group
     **/
    router.delete('/:groupId/users',checkAPIKey, checkUserAdmin,(request,response) => {

        const groupId = request.params.groupId;  
        const userIds = request.body.users;
        const groupModel = GroupModel.get();

        // Check params
        if (!mongoose.Types.ObjectId.isValid(groupId))
            return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.groupidIsWrong);

        if (!userIds || !Array.isArray(userIds))
            return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.wrongUserIds);

        async.waterfall([
            (done) => {

                const result = {};

                GroupLogic.getDetails(groupId ,null, (group, err) => {

                    if(!group){
                        done({
                            code: Const.errorMessage.groupidIsWrong
                        },null);
                        return;
                    }

                    result.groupDetail = group;
                    done(null,result);

                }, (err) => {
                    console.log("Critical Error", err);
                    done(err,result)
                });

            },
            (result,done) => {

                const newUsers = result.groupDetail.users.filter((userId) => {

                    return userIds.indexOf(userId) == -1;

                });

                result.newUsers = newUsers;

                done(null,result);

            },
            (result,done) => {

                groupModel.update({ _id: groupId }, {
                    users:result.newUsers
                }, (err, updated) => {

                    if(!err)
                        result.groupDetail.users = result.newUsers;

                    done(err, result);

                });

            }
        ],
        (err,result) => {

            if(err){

                if(err.code && err.code == Const.errorMessage.groupidIsWrong)
                    return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.groupidIsWrong);

                self.errorResponse(response, Const.httpCodeServerError);
                return;

            }

            self.successResponse(response, Const.responsecodeSucceed, {
                group:result.groupDetail
            }); 

        });

    });


    /**
     * @api {get} /groups/{groupId}/messages/ Get list of messages sent to group
     **/
    router.get('/:groupId/messages',checkAPIKey, (request,response) => {
        
        const userModel = UserModel.get();
        const groupId = request.params.groupId;        
        const q = self.checkQueries(request.query);

        // Check params
        if (!mongoose.Types.ObjectId.isValid(groupId))
            return response.status(Const.httpCodeBadParameter).send("Bad Parameter");
        
        async.waterfall([
            (done) => {

                const result = {};

                GroupLogic.getDetails(groupId ,null, (group, err) => {

                    if(!group){
                        done({
                            code: Const.errorMessage.groupidIsWrong
                        },null);

                        return;
                    }

                    result.groupDetail = group;
                    done(null,result);

                }, (err) => {
                    console.log("Critical Error", err);
                    done(err,result)
                });

            },
            (result,done) => {

                // find messsages
                MessageListLogic.get(request.user._id
                        ,Const.chatTypeGroup + "-" + result.groupDetail.id
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

                if(err.code && err.code == Const.errorMessage.groupidIsWrong)
                    return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.groupidIsWrong);

                self.errorResponse(response, Const.httpCodeServerError);
                return;
            }

            self.successResponse(response, Const.responsecodeSucceed, {
                messages: result.messages
            }); 

        });

    });


    return router;
}

/**
 * The following is the validation functions
 */

GroupsController.prototype.validatePresence = (values, callback) => {
    let error = {};
    if (!values.name) {
        error.message = Const.errorMessage.nameNotExist;
    }

    if (error.message) {
        error.code = Const.httpCodeBadParameter;
    } else {
        error = null;
    }
    callback(error);
}

GroupsController.prototype.validateMaxLength = (values, callback) => {
    let error = {};
    if (values.name && values.name.length > Const.nameMaxLength) {
        error.message = Const.errorMessage.nameTooLarge;
    } else if (values.sortName && values.sortName.length > Const.nameMaxLength) {
        error.message = Const.errorMessage.sortNameTooLarge;
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

GroupsController.prototype.validateDuplication = (name, organizationId, callback) => {
    const groupModel = GroupModel.get();  
    groupModel.findOne({
        name: name,
        organizationId: organizationId,
        type: Const.groupType.group
    }, (err, foundGroup) => {
        if (foundGroup) {
            callback({
                code: Const.httpCodeBadParameter,
                message: Const.errorMessage.groupDuplicated
            });
        } else {
            callback(null);
        }
    });
}

GroupsController.prototype.validateUserIdIsCorrect = (users, callback) => {
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

GroupsController.prototype.validateUsersPresence = (users, organizationId, callback) => {
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

module["exports"] = new GroupsController();
