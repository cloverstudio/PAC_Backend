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

const GroupsController = function(){};
_.extend(GroupsController.prototype, APIBase.prototype);

GroupsController.prototype.init = function(app){
        
    var self = this;

    /**
     * @api {get} /api/v3/groups/ get group list
     **/
    router.get('/',checkAPIKey, (request,response) => {
        const q = self.checkQueries(request.query);
        if (!q) return response.status(Const.httpCodeBadParameter).send("Bad Parameters");

        GroupLogic.search(request.user, q.keyword, q.offset, q.limit, q.sort, q.fields, (result, err) => {
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
        let users = [];
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
            // Validate presense
            (result, done) => {
                self.validatePresence(result.fields, (err) => {
                    done(err, result);
                });
            },
            // Validate text of max length
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
            // Validate the set users exist in database, or not.
            (result, done) => {       
                if (result.fields.users) {
                    users = result.fields.users.split(",");
                    users = _.map(users, (user) => {
                        return user.trim();
                    });                  
                    self.validateUsersPresence(users, request.user.organizationId, (err) => {
                        done(err, result);  
                    });
                } else {
                    done(null, result);
                }
            }
        ],
        (err, result) => {
            if (err === Const.httpCodeBadParameter)
                return response.status(Const.httpCodeBadParameter).send("Bad Parameter");

            const name = result.fields.name;
            const sortName = result.fields.sortName;
            const description = result.fields.description;
            const avatar = result.avatar;

            GroupLogic.create(request.user, name, sortName, description, users, avatar, (createdGroup, err) => {
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
        const q = self.checkQueries(request.query);

        // Check params
        if (!mongoose.Types.ObjectId.isValid(groupId))
            return response.status(Const.httpCodeBadParameter).send("Bad Parameter");
        if (!q) 
            return response.status(Const.httpCodeBadParameter).send("Bad Parameter");
        
        GroupLogic.getDetails(groupId ,q.fields, (group, err) => {
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
        let users = [];
        const uploadPathError = self.checkUploadPath();          
        
        async.waterfall([
            // Validate the groupId is handleable by mongoose
            (done) => {
                if (!mongoose.Types.ObjectId.isValid(groupId))
                    return done(Const.httpCodeBadParameter)
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
                    const result = { avatar: files.avatar, fields: fields }
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
            }
        ],
        (err, result) => {
            if (err === Const.httpCodeBadParameter)
                return response.status(Const.httpCodeBadParameter).send("Bad Parameter");

            const name = result.fields.name;
            const sortName = result.fields.sortName;
            const description = result.fields.description;
            const avatar = result.avatar;

            GroupLogic.update(groupId, request.user, name, sortName, description, avatar, (updated, err) => {
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
                    done(Const.httpCodeBadParameter, null);
                } else {
                    done(null, null);
                }
            },
            // get group which should be deleted
            (result, done) => {
                const groupModel = GroupModel.get();
                groupModel.findOne({_id: groupId}, (err, foundGroup) => {
                    if (!foundGroup) return done(Const.httpCodeBadParameter, null);
                    done(err, { group: foundGroup })
                });
            },
        ],
        (err, result) => {
            if (err === Const.httpCodeBadParameter)
                return response.status(Const.httpCodeBadParameter).send("Bad Parameter");
            
            GroupLogic.delete(result.group, request.user, (group, err) => {
                self.successResponse(response, Const.responsecodeSucceed); 
            }, (err) => {
                console.log("Critical Error", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            });
        })
    });

    return router;
}

/**
 * The following is the validation functions
 */

GroupsController.prototype.validatePresence = (values, callback) => {
    let error = null;
    if (!values.name)
        error = Const.httpCodeBadParameter;
    callback(error);
}

GroupsController.prototype.validateMaxLength = (values, callback) => {
    let error = null;
    if (values.name && values.name.length > Const.nameMaxLength) {
        error = Const.httpCodeBadParameter;
    } else if (values.sortName && values.sortName.length > Const.nameMaxLength) {
        error = Const.httpCodeBadParameter;
    } else if (values.description && values.description.length > Const.descriptionMaxLength) {
        error = Const.httpCodeBadParameter;
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
            callback(Const.httpCodeBadParameter);
        } else {
            callback(null);
        }
    });
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
        if (err) return callback(Const.httpCodeBadParameter);
        _.each(foundUsers, (user) => {
            if(!_.includes(users, user._id.toString())) {
                return callback(Const.httpCodeBadParameter);                                
            }
        });
        callback(null);                                                            
    }); 
}

module["exports"] = new GroupsController();
