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

const UserLogic = require( pathTop + "Logics/v3/User");

const UsersController = function(){};
_.extend(UsersController.prototype, APIBase.prototype);

UsersController.prototype.init = function(app){
        
    var self = this;

    /**
     * @api {post} /api/v3/users create a new user
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
            // Validate presense
            (result, done) => {
                self.validation(result.fields, (err) => {
                    done(err, result);
                });
            },
            //Validate the new userid is duplicated, or not.
            (result, done) => {
                if (uploadPathError) 
                    return done(uploadPathError, result);
                self.validateDuplication(result.fields.userid, request.user.organizationId, (err) => {
                    done(err, result);   
                });
            },
            // Validate the groupId in groups is correct format.
            (result, done) => {
                if (result.fields.groups) {
                    const groups = result.fields.groups.split(",");
                    result.fields.groups = _.map(groups, (group) => {
                        return group.trim();
                    });
                    self.validateGroupIdIsCorrect(result.fields.groups, (err) => {
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

    return router;
}

/**
 * The following is the validation functions
 */

UsersController.prototype.validation = (values, callback) => {
    let error = {};
    if (!values.name) {
        error.message = Const.errorMessage.nameNotExist;
    } else if (!values.userid) {
        error.message = Const.errorMessage.useridNotExist;
    } else if (!values.password) {
        error.message = Const.errorMessage.passwordNotExist;
    } else if (values.name && values.name.length > Const.nameMaxLength) {
        error.message = Const.errorMessage.nameTooLarge;
    } else if (values.sortName && values.sortName.length > Const.nameMaxLength) {
        error.message = Const.errorMessage.sortNameTooLarge;
    } else if (values.description && values.description.length > Const.descriptionMaxLength) {
        error.message = Const.errorMessage.descriptionTooLarge;
    } else if (values.userid.length < Const.inputInfoMinLength) {
        error.message = Const.errorMessage.useridTooShort;        
    } else if (values.userid.length > Const.nameMaxLength) {
        error.message = Const.errorMessage.useridTooLarge;                        
    } else if (values.password.length < Const.inputInfoMinLength) {
        error.message = Const.errorMessage.passwordTooShort;                
    } else if (values.password.length > Const.nameMaxLength) {
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

UsersController.prototype.validateGroupIdIsCorrect = (groups, callback) => {
    let err = null;
    _.each(groups, (groupId) => {
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
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
