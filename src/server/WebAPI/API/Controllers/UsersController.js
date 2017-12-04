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

const GroupModel = require(pathTop + 'Models/Group');
const UserModel = require(pathTop + 'Models/User');  

const UserLogic = require( pathTop + "Logics/v3/User");

const UsersController = function(){};
_.extend(UsersController.prototype, APIBase.prototype);

UsersController.prototype.init = function(app){
        
    var self = this;

    /**
     * @api {post} /api/v3/users create a new user
     */
    router.post('/', checkAPIKey, checkUserAdmin, (request, response) => {

        async.waterfall([
            (done) => {
                self.parseFormData(request, (err, result) => {
                    done(err, result);
                });
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
            //Validate the new userid is duplicated, or not.
            (result, done) => {
                self.validateDuplication(result.fields.userid, request.user.organizationId, (err) => {
                    done(err, result);   
                });
            },
            // Validate the userid in groups is correct format.
            (result, done) => {
                if (result.fields.groups) {
                    const groups = result.fields.groups.split(",");
                    result.fields.groups = _.map(groups, (group) => {
                        return group.trim();
                    });
                    self.validateuseridIsCorrect(result.fields.groups, (err) => {
                        done(err, result);  
                    });
                } else {
                    done(null, result);
                } 
            },
            // Validate the set groups exist in database, or not.
            (result, done) => {       
                if (result.fields.groups) {
                    self.validateGroupsPresence(result.fields.groups, request.user.organizationId, (err) => {
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
            UserLogic.create(request.user, result.fields, result.avatar, (created, err) => {
                self.successResponse(response, Const.responsecodeSucceed, {
                    user: created
                });
            }, (err) => {
                console.log("Critical Error", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            }); 
        });
    });
    

    /**
     * @api {get} /api/v3/users/{userid} get user details
     **/
    router.get('/:userid',checkAPIKey, (request,response) => {
        const userid = request.params.userid;        
        const query = self.checkQueries(request.query);

        // Check params
        if (!mongoose.Types.ObjectId.isValid(userid))
            return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.useridIsWrong);
        if (!query) 
            return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.offsetIsMinus);
        
        UserLogic.getDetails(userid ,query.fields, (user, err) => {
            self.successResponse(response, Const.responsecodeSucceed, {
                user: user
            }); 
        }, (err) => {
            console.log("Critical Error", err);
            return self.errorResponse(response, Const.httpCodeServerError);
        });
    });


    /**
     * @api {put} /api/v3/Users/{userid} edit user details
     **/
    router.put('/:id', checkAPIKey, checkUserAdmin, (request,response) => {
        const userid = request.params.id;

        async.waterfall([
            // Validate the userid is handleable by mongoose
            (done) => {
                if (!mongoose.Types.ObjectId.isValid(userid)) {
                    return done({
                        code: Const.httpCodeBadParameter,
                        message: Const.errorMessage.useridIsWrong
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
            //Validate the new userid is duplicated, or not.
            (result, done) => {
                self.validateDuplication(result.fields.userid, request.user.organizationId, (err) => {
                    done(err, result);   
                });
            },
            // Validate the userid in groups is correct format.
            (result, done) => {
                if (result.fields.groups) {
                    const groups = result.fields.groups.split(",");
                    result.fields.groups = _.map(groups, (group) => {
                        return group.trim();
                    });
                    self.validateuseridIsCorrect(result.fields.groups, (err) => {
                        done(err, result);  
                    });
                } else {
                    done(null, result);
                } 
            },
            // Validate the set groups exist in database, or not.
            (result, done) => {       
                if (result.fields.groups) {
                    self.validateGroupsPresence(result.fields.groups, request.user.organizationId, (err) => {
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

            UserLogic.update(userid, request.user, result.fields, result.avatar, (updated, err) => {
                self.successResponse(response, Const.responsecodeSucceed); 
            }, (err) => {
                console.log("Critical Error", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            });
        });
    });


    /**
     * @api {delete} /api/v3/Users/{userid} delete group details
     **/
    router.delete('/:id',checkAPIKey, checkUserAdmin, (request,response) => {
        const userid = request.params.id;        
        // Check params
        async.waterfall([
            (done) => {
                if (!mongoose.Types.ObjectId.isValid(userid)) {
                    return done({
                        code: Const.httpCodeBadParameter,
                        message: Const.errorMessage.useridIsWrong
                    }, null);
                }
                done(null, null);
            },
            // get user which should be deleted
            (result, done) => {
                const userModel = UserModel.get();
                userModel.findOne({_id: userid}, (err, foundUser) => {
                    if (!foundUser) {
                        return done({
                            code: Const.httpCodeBadParameter,
                            message: Const.errorMessage.useridIsWrong
                        }, null);
                    }
                    if (err) {
                        return done({ code: err.status, message: err.text }, null);
                    }
                    done(null, { deleteUser: foundUser })
                });
            },
        ],
        (err, result) => {
            if (!_.isEmpty(err))
                return response.status(err.code).send(err.message);
            
            UserLogic.delete(result.deleteUser, request.user, (group, err) => {
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

UsersController.prototype.validatePresence = (values, callback) => {
    let error = {};
    if (!values.name) {
        error.message = Const.errorMessage.nameIsEmpty;
    } else if (!values.userid) {
        error.message = Const.errorMessage.userIdIsEmpty;
    } else if (!values.password) {
        error.message = Const.errorMessage.passwordIsEmpty;
    } else if (values.permission != Const.userPermission.webClient && values.permission != Const.userPermission.subAdmin) {
        error.message = Const.errorMessage.wrongUserPermission;
    }

    if (error.message) {
        error.code = Const.httpCodeBadParameter;
    } else {
        error = null;
    }
    callback(error);
}

UsersController.prototype.validateMaxLength = (values, callback) => {
    let error = {};
    if (values.name && values.name.length > Const.nameMaxLength) {
        error.message = Const.errorMessage.nameTooLarge;
    } else if (values.sortName && values.sortName.length > Const.nameMaxLength) {
        error.message = Const.errorMessage.sortNameTooLarge;
    } else if (values.description && values.description.length > Const.descriptionMaxLength) {
        error.message = Const.errorMessage.descriptionTooLarge;
    } else if (values.userid && values.userid.length < Const.inputInfoMinLength) {
        error.message = Const.errorMessage.useridTooShort;        
    } else if (values.userid && values.userid.length > Const.nameMaxLength) {
        error.message = Const.errorMessage.useridTooLarge;                        
    } else if (values.password && values.password.length < Const.inputInfoMinLength) {
        error.message = Const.errorMessage.passwordTooShort;                
    } else if (values.password && values.password.length > Const.nameMaxLength) {
        error.message = Const.errorMessage.passwordTooLarge;                
    }

    if (error.message) {
        error.code = Const.httpCodeBadParameter;
    } else {
        error = null;
    }
    callback(error);
}


UsersController.prototype.validateDuplication = (userid, organizationId, callback) => {
    const userModel = UserModel.get();
    userModel.findOne({
        userid: userid,
        organizationId: organizationId,
    }, (err, foundUser) => {
        if (foundUser) {
            callback({ 
                code: Const.httpCodeBadParameter, 
                message: Const.errorMessage.userDuplicated
            });
        } else {
            callback(null);
        }
    });
}

UsersController.prototype.validateuseridIsCorrect = (groups, callback) => {
    let err = null;
    _.each(groups, (userid) => {
        if (!mongoose.Types.ObjectId.isValid(userid)) {
            err = {
                code: Const.httpCodeBadParameter,
                message: Const.errorMessage.includeGroupsNotExist
            };
        }
    });
    callback(err);   
}

UsersController.prototype.validateGroupsPresence = (groups, organizationId, callback) => {
    const groupModel = GroupModel.get();
    const conditions = {
        $and: [
            {organizationId: organizationId},
            { _id: { $in: groups } }
        ]
    }
    groupModel.find(conditions,{_id:1}, (err, foundGroups) => {    
        if (err) {
            return callback({
                code: Const.httpCodeBadParameter,
                message: err.message
            });
        }
        if (groups.length!==foundGroups.length) {
            return callback({
                code: Const.httpCodeBadParameter,
                message: Const.errorMessage.includeGroupsNotExist
            }); 
        }
        _.each(foundGroups, (group) => {
            if(!_.includes(groups, group._id.toString())) {
                return callback({
                    code: Const.httpCodeBadParameter,
                    message: Const.errorMessage.includeGroupsNotExistInOrganiation
                });                   
            }
        });
        callback(null);                                                            
    }); 
}

module["exports"] = new UsersController();
