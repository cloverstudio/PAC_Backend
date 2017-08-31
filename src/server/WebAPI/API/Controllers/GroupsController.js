const _ = require('lodash');
const express = require('express');
const router = express.Router();

const pathTop = "../../../";

const Const = require( pathTop + "lib/consts");
const Config = require( pathTop + "lib/init");
const Utils = require( pathTop + "lib/utils");

const checkAPIKey = require( pathTop + 'lib/authApiV3');
const APIBase = require('./APIBase');
const checkUserAdmin = require('../../../lib/authV3.js').checkUserAdmin;

const formidable = require('formidable');
const async = require('async');

const GroupModel = require(pathTop + 'Models/Group');
const UserModel = require(pathTop + 'Models/User');                


const SearchGroupLogic = require( pathTop + "Logics/v3/SearchGroup");
const CreateGroupLogic = require( pathTop + "Logics/v3/CreateGroup");

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

        SearchGroupLogic.search(request.user, q.keyword, q.offset, q.limit, q.sort, q.fields, (result, err) => {
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
        
        const form = new formidable.IncomingForm();
        let error = null;
        let users = [];

        async.waterfall([
            (done) => {
                form.parse(request, (err, fields, files) => {
                    const result = { avatar: files.avatar, fields: fields }
                    done(err, result);
                })
            },
            // Validate presense
            (result, done) => {
                error = self.validatePresenceAndMaxLength(result.fields);
                done(error, result);
            },
            //Validate the new name is duplicated, or not.
            (result, done) => {
                self.validateDuplication(result.fields.name, request.user.organizationId, (error) => {
                    done(error, result);   
                });
            },
            // Validate the set users exist in database, or not.
            (result, done) => {       
                if (result.fields.users) {
                    users = result.fields.users.split(",");                    
                    self.validateUsersPresence(users, request.user.organizationId, (error) => {
                        done(error, result);  
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

            CreateGroupLogic.create(request.user, name, sortName, description, users, avatar, (createdGroup, err) => {
                self.successResponse(response, Const.responsecodeSucceed, {
                    group: createdGroup
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

GroupsController.prototype.validatePresenceAndMaxLength = (values) => {
    let error = null;
    if (!values.name) {
        error = Const.httpCodeBadParameter;
    } else if (values.name.length > Const.nameMaxLength) {
        error = Const.httpCodeBadParameter;
    } else if (values.sortName && values.sortName.length > Const.nameMaxLength) {
        error = Const.httpCodeBadParameter;
    } else if (values.description && values.description.length > Const.descriptionMaxLength) {
        error = Const.httpCodeBadParameter;
    }
    return error;
}

GroupsController.prototype.validateDuplication = (values) => {
    const groupModel = GroupModel.get();  
    groupModel.findOne({
        name: result.fields.name,
        organizationId: request.user.organizationId,
        type: Const.groupType.group
    }, (err, foundGroup) => {
        if (foundGroup) {
            return Const.httpCodeBadParameter;
        } else {
            return null;
        }
    });
}

GroupsController.prototype.validateDuplication = (name, organizationId, callback) => {
    const groupModel = GroupModel.get();  
    groupModel.findOne({
        name: name,
        organizationId: organizationId,
        type: Const.groupType.group
    }, (err, foundGroup) => {
        if (foundGroup) {
            callback(422);
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
