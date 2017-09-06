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
     * @api {post} /api/v3/Users create a new group
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
            }
        ],
        (err, result) => {
            if (!_.isEmpty(err))
                return response.status(err.code).send(err.message);

            const name = result.fields.name;
            const sortName = result.fields.sortName;
            const description = result.fields.description;
            const avatar = result.avatar;

            UserLogic.create(request.user, name, sortName, description, users, avatar, (createdGroup, err) => {
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
     * @api {get} /api/v3/Users/{groupId} get group details
     **/
    router.get('/:groupId',checkAPIKey, (request,response) => {
        const groupId = request.params.groupId;        
        const q = self.checkQueries(request.query);

        // Check params
        if (!mongoose.Types.ObjectId.isValid(groupId))
            return response.status(Const.httpCodeBadParameter).send("Bad Parameter");
        if (!q) 
            return response.status(Const.httpCodeBadParameter).send("Bad Parameter");
        
        UserLogic.getDetails(groupId ,q.fields, (group, err) => {
            self.successResponse(response, Const.responsecodeSucceed, {
                group: group
            }); 
        }, (err) => {
            console.log("Critical Error", err);
            return self.errorResponse(response, Const.httpCodeServerError);
        });
    });


    /**
     * @api {put} /api/v3/Users/{groupId} edit group details
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

            UserLogic.update(groupId, request.user, name, sortName, description, avatar, (updated, err) => {
                self.successResponse(response, Const.responsecodeSucceed); 
            }, (err) => {
                console.log("Critical Error", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            });
        });
    });


    /**
     * @api {delete} /api/v3/Users/{groupId} delete group details
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
            
            UserLogic.delete(result.group, request.user, (group, err) => {
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

module["exports"] = new UsersController();
