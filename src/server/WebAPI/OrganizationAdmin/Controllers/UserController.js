/** Called for URL /admin/user */

var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');
var JSON = require('JSON2');
var async = require('async');
var validator = require('validator');
var fs = require('fs');
var csv = require('csv');
var jschardet = require('jschardet');
var Iconv = require('iconv').Iconv;

var Const = require("../../../lib/consts");
var Config = require("../../../lib/init");
var BackendBaseController = require("./BackendBaseController");
var DatabaseManager = require('../../../lib/DatabaseManager');
var SocketAPIHandler = require("../../../SocketAPI/SocketAPIHandler");

var Utils = require('../../../lib/utils');

var UserModel = require('../../../Models/User');
var GroupModel = require('../../../Models/Group');
var OrganizationSettingsModel = require('../../../Models/OrganizationSettings');
var OrganizationModel = require('../../../Models/Organization');
var HistoryModel = require('../../../Models/History');

var checkUserAdmin = require('../../../lib/auth.js').checkUserAdmin;

var NewUserLogic = require('../../../Logics/NewUser');
var UpdateOrganizationDiskUsageLogic = require("../../../Logics/UpdateOrganizationDiskUsage");

var formidable = require('formidable');
var fs = require('fs');
var easyImg = require('easyimage');

var UserController = function(){
}

// extends from basecontroller
_.extend(UserController.prototype, BackendBaseController.prototype);

UserController.prototype.init = function(app){
    
    var self = this;

    router.get('/list', checkUserAdmin, function(request, response) {
        
        var baseUser = request.session.user;
        var baseOrganization = request.session.organization;

        var page = request.query.page;
        if(!page)
            page = 1;
            
        var templateParams = {
            page : "user-list",
            openMenu : "user",
            maxUserNumber: baseOrganization.maxUserNumber
        };
        
        var model = UserModel.get();
        var modelGroup = GroupModel.get();

        var keyword = request.session.userKeyword;
        var showUsersWithoutDepartments = request.session.showUsersWithoutDepartments;

        var organizationId = baseUser.organizationId;
        
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);

        var criteria = {};
        criteria.organizationId = organizationId;

        if (!organizationAdmin) {
            criteria.groups = { $in: baseUser.groups };
            criteria._id = { $ne: baseUser._id };
        }

        if (!_.isEmpty(keyword)) {            
            criteria.name = new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i");            
        }

        async.waterfall([
            
            function(done) {
                
                var result = {};
                                
                model.find(criteria).
                    limit(Const.pagingRows).
                    skip( (page - 1 ) * Const.pagingRows).
                    sort({ created: "asc" }).
                exec(function(err, findUsers) {
                    
                    var users = [];
                    var groupNames = "";

                    var groupIds = _.flattenDeep(_.map(findUsers, 'groups'));

                    modelGroup.find({ _id: { $in: groupIds } }, { name: true, type: true }, function(err, findGroups) {

                        var departments = _.filter(findGroups, { type: Const.groupType.department });
                        var departmentIds = _.map(departments, '_id').toString().split(",");

                        _.forEach(findUsers, function(user) { 
                            
                            user = user.toObject();
                            groupNames = "";                                                

                            // if checkbox "show users withpout departments" is checked
                            if (!_.isEmpty(showUsersWithoutDepartments)) {

                                // if user doesn't have departments 
                                if (_.isEmpty(_.intersection(user.groups, departmentIds))) {
                                
                                    _.forEach(user.groups, function(groupId, index) { 
                                        
                                        if (index > 4) return;

                                        if (!groupNames)
                                            groupNames = _.result(_.find(findGroups, { _id: DatabaseManager.toObjectId(groupId) }), "name");
                                        else
                                            groupNames += ", " + _.result(_.find(findGroups, { _id: DatabaseManager.toObjectId(groupId) }), "name");

                                    });

                                    user.groupNames = groupNames;
                                    user.showEditDelete = (user.permission != Const.userPermission.organizationAdmin || organizationAdmin);
                                    
                                    users.push(user);

                                }

                            } else {

                                _.forEach(user.groups, function(groupId, index) { 
                                    
                                    if (index > 4) return;

                                    if (!groupNames)
                                        groupNames = _.result(_.find(findGroups, { _id: DatabaseManager.toObjectId(groupId) }), "name");
                                    else
                                        groupNames += ", " + _.result(_.find(findGroups, { _id: DatabaseManager.toObjectId(groupId) }), "name");

                                });

                                user.groupNames = groupNames;
                                user.showEditDelete = (user.permission != Const.userPermission.organizationAdmin || organizationAdmin);

                                users.push(user);

                            }

                        });
                        
                        result.list = users;
                        result.departmentIds = departmentIds;

                        done(err, result);

                    });
                    
                });
            
            },
            function(result, done) {
                
                if (organizationAdmin && !_.isEmpty(showUsersWithoutDepartments)) {
                    criteria.groups = { $nin: result.departmentIds };
                }

                // get count
                model.count(criteria, function(err, countResult) {
                
                    result.count = countResult;
                    done(null, result);
                    
                });
                
            },
            function(result, done) {

                self.numberOfUsersInOrganization(model, baseUser.organizationId, (err, numberOfUsers) => {

                    result.numberOfUsers = numberOfUsers;
                    done(err, result);

                });
                
            }
        ],
        function (err, result) {

            if(err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
            else
                templateParams.list = result.list;
            
            var listCountFrom = (result.count) ? Const.pagingRows * (page - 1) + 1 : result.count;
            var listCountTo = (Const.pagingRows * page > result.count) ? result.count : Const.pagingRows * page;
            
            templateParams.paging = {
                
                page : page,
                count : result.count,
                listCountFrom : listCountFrom,
                listCountTo : listCountTo,
                rows : Const.pagingRows,
                baseURL : "/admin/user/list?page="
                
            }
            
            if (request.query.delete) {
                templateParams.successMessage = self.l10n('The user is successfully deleted.');
            }
            
            if (request.query.resetDevice) {
                templateParams.successMessage = self.l10n('The user\'s devices are reset.');
            }

            templateParams.keyword = keyword;
            templateParams.showUsersWithoutDepartments = showUsersWithoutDepartments;
            templateParams.organizationAdmin = organizationAdmin;
            templateParams.numberOfUsers = result.numberOfUsers;
            
            self.render(request,response, '/User/List', templateParams);
            
        });

    });
    
    router.all('/search', checkUserAdmin, function(request, response) {

        var templateParams = {
            page : "user-list",
            openMenu : "user"
        };

        var keyword = request.body.keyword;        
        var showUsersWithoutDepartments = request.body.showUsersWithoutDepartments;        
        
        request.session.userKeyword = keyword;
        request.session.showUsersWithoutDepartments = showUsersWithoutDepartments;
            
        response.redirect('/admin/user/list');  
        
    });
    
    router.get('/add', checkUserAdmin, function(request, response) {

        var baseUser = request.session.user;

        var templateParams = {
            page : "user-list",
            openMenu : "user",
            organizationAdmin: (baseUser.permission == Const.userPermission.organizationAdmin)
        };
        
        async.waterfall([
            
            function(done) {
                
                self.getGroups(baseUser, GroupModel, Const.groupType.group, function(err, groupData) {
                    done(err, { groupList: groupData, status: 1, permission: Const.userPermission.webClient });
                });
                
            },
            function(result, done) {
                                
                self.getGroups(baseUser, GroupModel, Const.groupType.department, function(err, departmentData) {

                    result.departmentList = departmentData;
                    done(err, result);

                });

            }
        ],
        function(err, result) {

            if(err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
        
            templateParams.formValues = result;
            
            if (!templateParams.organizationAdmin) {
                templateParams.formValues.groups = baseUser.defaultDepartments;                
                templateParams.formValues.defaultDepartments = baseUser.defaultDepartments;
            };

            self.render(request, response, '/User/Add', templateParams);

        });

    }); 
    
    router.post('/add', checkUserAdmin, function(request, response) {

        var baseUser = request.session.user;
        var baseOrganization = request.session.organization;

        var templateParams = {
            page : "user-list",
            openMenu : "user",
            organizationAdmin: (baseUser.permission == Const.userPermission.organizationAdmin)
        };
        
        var model = UserModel.get();
        var uploadPathError = self.checkUploadPath();
                
        async.waterfall([

            function(done) {
               
                var form = new formidable.IncomingForm();
                form.uploadDir = Config.uploadPath;

                form.on('fileBegin', function(name, file) {

                    file.path = path.dirname(file.path) + "/" + Utils.getRandomString();

                });

                var groups = [];

                // this is used because formidable forms does not parse array values
                form.on('field', function(name, value) {

                    if (name.toLowerCase() == "groups") groups.push(value);
                    
                });

                form.onPart = function(part) {

                    if (part.filename) {

                        if (!uploadPathError) form.handlePart(part);

                    } else if (part.filename != "") { 

                        form.handlePart(part);

                    }

                }

                form.parse(request, function(err, fields, files) {
                    
                    fields.groups = groups;
                    done(err, { file: files.file, formValues: fields });

                });

            },
            function(result, done) {

                self.getGroups(baseUser, GroupModel, Const.groupType.group, function(err, groupData) {
                    
                    result.groupList = groupData;
                    done(err, result);

                });
                
            },
            function(result, done) {
                                
                self.getGroups(baseUser, GroupModel, Const.groupType.department, function(err, departmentData) {

                    result.departmentList = departmentData;
                    done(err, result);

                });

            },
            function(result, done) {

                templateParams.formValues = result.formValues;
                templateParams.formValues.groupList = result.groupList;
                templateParams.formValues.departmentList = result.departmentList;
                
                templateParams.file = result.file;

                if (uploadPathError) {
                    done(uploadPathError, result);
                    return;
                };

                if (!templateParams.organizationAdmin) {

                    if (_.isEmpty(templateParams.formValues.groups))
                        templateParams.formValues.groups = baseUser.defaultDepartments;
                    else                        
                        templateParams.formValues.groups = _.union(_.flattenDeep([templateParams.formValues.groups]), baseUser.defaultDepartments);
                    
                    templateParams.formValues.defaultDepartments = baseUser.defaultDepartments;

                };

                var errorMessage = self.validation({ formValues: templateParams.formValues, file: templateParams.file }, false);
        
                if(!_.isEmpty(errorMessage)) {

                    templateParams.formValues.password = "";
                    
                    if (templateParams.file) fs.unlink(templateParams.file.path, function() {});

                    templateParams.errorMessage = errorMessage;
                    self.render(request,response, '/User/Add', templateParams);
                    
                    return;
                }

                // check duplication
                model.findOne({ 
                    userid: Utils.getCIString(templateParams.formValues.userid),
                    organizationId: baseUser.organizationId
                }, function(err, findResult) {

                    if(findResult) { 
                        
                        templateParams.formValues.password = "";

                        if (templateParams.file) fs.unlink(templateParams.file.path, function() {});

                        templateParams.errorMessage = self.l10n('The userid is taken.');
                        self.render(request, response, '/User/Add', templateParams);
                        
                        return;
                        
                    } else {
                        
                        done(err, result);
                        
                    }
                     
                });
                
            },
            function(result, done) {
                
                self.numberOfUsersInOrganization(model, baseUser.organizationId, (err, numberOfUsers) => {

                    if (numberOfUsers >= baseOrganization.maxUserNumber) { 
                        
                        templateParams.formValues.password = "";

                        if (templateParams.file) fs.unlink(templateParams.file.path, function() {});

                        templateParams.errorMessage = self.l10n('You can\'t add more users to this organization. Maximum number of users in this organization is ' + 
                            baseOrganization.maxUserNumber + '.');

                        self.render(request, response, '/User/Add', templateParams);
                        
                        return;
                        
                    } else {
                        
                        done(err, result);
                        
                    }

                });

            },
            function(result, done) {
            
                NewUserLogic.create(
                    templateParams.formValues.name,
                    templateParams.formValues.sortName,
                    templateParams.formValues.description,
                    templateParams.formValues.userid,
                    templateParams.formValues.password, 
                    templateParams.formValues.status, 
                    baseUser.organizationId, 
                    (templateParams.organizationAdmin) ? templateParams.formValues.permission : Const.userPermission.webClient, 
                    _.isEmpty(templateParams.formValues.groups) ? [] : templateParams.formValues.groups,
                    templateParams.file,
                function(err, saveResult) {

                    done(err, result);
                    
                });

            }
        ],
        function(err, result) {
            
            if (err) {
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
                
                if (templateParams.file) fs.unlink(templateParams.file.path, function() {});

            } else {
                templateParams.successMessage = self.l10n('New user is created.');
            }

            templateParams.formValues.password = "";
            
            self.render(request, response, '/User/Add', templateParams);

        });

    });
    

    router.get('/edit/:_id', checkUserAdmin, function(request, response){

        var _id = request.params._id;
        var baseUser = request.session.user;

        var templateParams = {
            page : "user-list",
            openMenu : "user",
            organizationAdmin: (baseUser.permission == Const.userPermission.organizationAdmin)
        };

        if(_.isEmpty(_id)){
            
            response.redirect('/admin/user/list');  
            return;
            
        }
        
        var model = UserModel.get();
        
        async.waterfall([
            
            function(done) {
                
                self.getGroups(baseUser, GroupModel, Const.groupType.group, function(err, groupData) {
                    done(err, { groupList: groupData });
                });
                
            },
            function(result, done) {
                                
                self.getGroups(baseUser, GroupModel, Const.groupType.department, function(err, departmentData) {

                    result.departmentList = departmentData;
                    done(err, result);

                });

            },
            function(result, done) {

                model.findOne({ _id: _id }, function(err, findResult) {
                    
                    if(!findResult) {
                        response.redirect('/admin/user/list');  
                        return;
                    }
                    
                    result.obj = findResult;
                    done(err, result);
                    
                });

            }
        ],
        function(err, result){

            if (err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
        
            templateParams.formValues = result.obj;
            templateParams.formValues.groupList = result.groupList;
            templateParams.formValues.departmentList = result.departmentList;
            templateParams.formValues.password = "";  

            // if permission not exist, assign subAdmin permission
            if (!templateParams.formValues.permission) templateParams.formValues.permission = Const.userPermission.subAdmin;

            templateParams.formValues.showPermission = (
                baseUser.permission == Const.userPermission.organizationAdmin &&
                result.obj.permission != Const.userPermission.organizationAdmin
            );
            
            self.render(request, response, '/User/Edit', templateParams);

        });
        
    });

   router.post('/edit/:_id', checkUserAdmin, function(request,response){

        var _id = request.params._id;
        var baseUser = request.session.user;

        var templateParams = {
            page : "user-list",
            openMenu : "user",
            organizationAdmin: (baseUser.permission == Const.userPermission.organizationAdmin)
        };
        
        if (_.isEmpty(_id)) {
            
            response.redirect('/admin/user/list');  
            return;
            
        }
        
        var model = UserModel.get();
        var historyModel = HistoryModel.get();
        var uploadPathError = self.checkUploadPath();
        
        async.waterfall([
            
            function(done) {
               
                var form = new formidable.IncomingForm();
                form.uploadDir = Config.uploadPath;

                form.on('fileBegin', function(name, file) {

                    file.path = path.dirname(file.path) + "/" + Utils.getRandomString();

                });

                var groups = [];

                // this is used because formidable forms does not parse array values
                form.on('field', function(name, value) {

                    if (name.toLowerCase() == "groups") groups.push(value);
                    
                });

                form.onPart = function(part) {

                    if (part.filename) {

                        if (!uploadPathError) form.handlePart(part);

                    } else if (part.filename != "") { 

                        form.handlePart(part);

                    }

                }

                form.parse(request, function(err, fields, files) {
                    
                    fields.groups = groups;
                    done(err, { file: files.file, formValues: fields });

                });

            },
            function(result, done) {

                self.getGroups(baseUser, GroupModel, Const.groupType.group, function(err, groupData) {
                    
                    result.groupList = groupData;
                    done(err, result);
                });
               
            },
            function(result, done) {
                                
                self.getGroups(baseUser, GroupModel, Const.groupType.department, function(err, departmentData) {

                    result.departmentList = departmentData;
                    done(err, result);

                });

            },
            function(result, done) {

                templateParams.formValues = result.formValues;
                templateParams.formValues.groupList = result.groupList;
                templateParams.formValues.departmentList = result.departmentList;
                
                templateParams.file = result.file;

                if (uploadPathError) {
                    done(uploadPathError, result);
                    return;
                };

                if (templateParams.formValues.deleteAvatar) {
                    model.findOne({ _id: _id }, { avatar: true }, function(errFind, findResult) {
                        if (findResult) {

                            templateParams.formValues.avatar = findResult.avatar;

                            var url = "";

                            if (templateParams.file) 
                                url = '/admin/user/deleteAvatar?' + 
                                    "_id=" + _id + 
                                    "&pictureName=" + templateParams.formValues.avatar.picture.nameOnServer + 
                                    "&pictureSize=" + templateParams.formValues.avatar.picture.size + 
                                    "&thumbnailName=" + templateParams.formValues.avatar.thumbnail.nameOnServer + 
                                    "&thumbnailSize=" + templateParams.formValues.avatar.thumbnail.size + 
                                    "&uploadFilePath=" + templateParams.file.path
                            else
                                url = '/admin/user/deleteAvatar?' + 
                                    "_id=" + _id + 
                                    "&pictureName=" + templateParams.formValues.avatar.picture.nameOnServer + 
                                    "&pictureSize=" + templateParams.formValues.avatar.picture.size + 
                                    "&thumbnailName=" + templateParams.formValues.avatar.thumbnail.nameOnServer + 
                                    "&thumbnailSize=" + templateParams.formValues.avatar.thumbnail.size

                            response.redirect(url);  

                        } else  {
                            response.redirect('/admin/user/list');
                        }
                    });
                    
                    return;

                } else {

                    model.findOne({ _id: _id }, { avatar: true }, function(errFind, findResult) {
                        
                        if (findResult) {
                            templateParams.formValues.avatar = findResult.avatar;
                        }

                        done(errFind, result);

                    });
                };   

            },
            function(result, done) {

                // get original data
                model.findOne({ _id: _id }, function(err, findResult) {
                    
                    if(!findResult) {

                        if (templateParams.file) fs.unlink(templateParams.file.path, function() {});

                        response.redirect('/admin/user/list');  
                        return;
                    }
                    
                    result.originalData = findResult;
                    done(err, result);
                    
                });

            },
            function(result, done) {

                templateParams.formValues.showPermission = (
                    baseUser.permission == Const.userPermission.organizationAdmin &&
                    result.originalData.permission != Const.userPermission.organizationAdmin
                );

                var errorMessage = self.validation({ formValues: templateParams.formValues, file: templateParams.file }, true);
        
                if (!_.isEmpty(errorMessage)) {

                    if (templateParams.file) fs.unlink(templateParams.file.path, function() {});

                    templateParams.formValues.password = "";
                    
                    templateParams.errorMessage = errorMessage;
                    self.render(request,response, '/User/Edit', templateParams);
                    
                    return;
                }

                // check duplication
                model.findOne({                
                    userid : Utils.getCIString(templateParams.formValues.userid),
                    organizationId: baseUser.organizationId,
                    _id : { $ne : _id }
                }, function(err, findResult) {
                    
                    if (findResult) {
                        
                        if (templateParams.file) fs.unlink(templateParams.file.path, function() {});

                        templateParams.formValues.password = "";

                        templateParams.errorMessage = self.l10n('The userid is taken.');
                        self.render(request,response,'/User/Edit',templateParams);
                        return;
                    }
                    
                    done(err, result);
                    
                });
                
            },
            function(result, done) {
                    
                var sortName = _.isEmpty(templateParams.formValues.sortName) ? templateParams.formValues.name.toLowerCase() : templateParams.formValues.sortName;

                // if current users permision is sub-admin, then permission is not showing
                if (!templateParams.formValues.showPermission) {

                    var groups = result.originalData.groups;

                    // remove currently visible groups and departments
                    _.remove(groups, function(groupId) { 

                        var remove = false;

                        if (!_.isEmpty(_.filter(result.groupList, { _id: DatabaseManager.toObjectId(groupId) })) ||
                            !_.isEmpty(_.filter(result.departmentList, { _id: DatabaseManager.toObjectId(groupId) }))) {

                            remove = true;

                        };

                        return remove;

                    });
                    
                    if (_.isEmpty(templateParams.formValues.groups))
                        templateParams.formValues.groups = groups;
                    else                        
                        templateParams.formValues.groups = _.union(groups, _.flattenDeep([templateParams.formValues.groups]));                        

                };

                // update
                var updateParams = {
                    name: templateParams.formValues.name,
                    sortName: sortName,
                    description: templateParams.formValues.description,
                    userid: templateParams.formValues.userid,
                    status: templateParams.formValues.status,
                    groups: _.isEmpty(templateParams.formValues.groups) ? [] : templateParams.formValues.groups
                };

                if(templateParams.formValues.status == "0")
                    updateParams.token = [];
                
                if(!_.isEmpty(templateParams.formValues.password)) {
                    updateParams.password = Utils.getHash(templateParams.formValues.password);
                }
                
                // save permissions if it's visible
                if (templateParams.formValues.showPermission) {

                    updateParams.permission = templateParams.formValues.permission;

                } else {

                    if (!result.originalData.permission) updateParams.permission = Const.userPermission.subAdmin;
                
                }

                if (templateParams.file) {

                    easyImg.thumbnail({
                         src: templateParams.file.path,
                         dst: path.dirname(templateParams.file.path) + "/" + Utils.getRandomString(),
                         width: Const.thumbSize,
                         height: Const.thumbSize
                    }).then(
                        function(thumbnail) {

                            updateParams.avatar = {

                                picture: {
                                    originalName: templateParams.file.name,
                                    size: templateParams.file.size,
                                    mimeType: templateParams.file.type,
                                    nameOnServer: path.basename(templateParams.file.path)
                                },
                                thumbnail: {
                                    originalName: templateParams.file.name,
                                    size: thumbnail.size,
                                    mimeType: thumbnail.type,
                                    nameOnServer: thumbnail.name
                                }

                            }

                            result.thumbnailPath = thumbnail.path;
                            result.thumbnailSize = thumbnail.size;
                            
                            model.update({ _id: _id }, updateParams, function(err, updateResult) {
                    
                                if (err) {
                                    done(err, result);
                                    return;
                                }

                                fs.unlink(Config.uploadPath + "/" + result.originalData.avatar.picture.nameOnServer, function() {});
                                fs.unlink(Config.uploadPath + "/" + result.originalData.avatar.thumbnail.nameOnServer, function() {});

                                var modelGroup = GroupModel.get();

                                // remove ($pull) current user in groups
                                modelGroup.update(
                                    { users: _id, organizationId: baseUser.organizationId },
                                    { $pull: { users: _id } }, 
                                    { multi: true }, 
                                function(err, updateResult) {

                                    if (err) {
                                        done(err, result);
                                        return;
                                    }

                                    // add ($push) current user in selected groups (formValues.groups)
                                    modelGroup.update(
                                        { _id: { $in: templateParams.formValues.groups } }, 
                                        { $push: { users: _id } }, 
                                        { multi: true }, 
                                    function(err, updateResult) {

                                        done(err, result);

                                    });  

                                });            

                            });

                        },
                        function (err) {
                            done(err, result);
                        }
                    );

                } else {

                    model.update({ _id: _id }, updateParams, function(err, updateResult) {
                    
                        if (err) {
                            done(err, result);
                            return;
                        }

                        var modelGroup = GroupModel.get();

                        // remove ($pull) current user in groups
                        modelGroup.update(
                            { users: _id, organizationId: baseUser.organizationId },
                            { $pull: { users: _id } }, 
                            { multi: true }, 
                        function(err, updateResult) {

                            if (err) {
                                done(err, result);
                                return;
                            }

                            // add ($push) current user in selected groups (formValues.groups)
                            modelGroup.update(
                                { _id: { $in: templateParams.formValues.groups } }, 
                                { $push: { users: _id } }, 
                                { multi: true }, 
                            function(err, updateResult) {

                                done(err, result);

                            });  

                        });            

                    });

                }
                
            },
            function(result, done) {

                // update organization disk usage
                if (templateParams.file) {

                    var size = 0;

                    if (result.originalData.avatar.picture.size) {

                        var originalSize = result.originalData.avatar.picture.size + result.originalData.avatar.thumbnail.size;
                        var newSize = templateParams.file.size + result.thumbnailSize;

                        size = newSize - originalSize;

                    } else {

                        size = templateParams.file.size + result.thumbnailSize;

                    }

                    UpdateOrganizationDiskUsageLogic.update(baseUser.organizationId, size, (err, updateResult) => {
                        done(err, result);
                    });
                    
                } else {

                    done(null, result);

                }

            },
            function (result, done) {

                model.findOne({ _id: _id }, { avatar: true }, function(err, findResult) {

                    if (findResult) {
                        templateParams.formValues.avatar = findResult.avatar;
                    }

                    done(err, result);

                });

            },
            function(result, done){

                // delete from history if user is deleted from group or department
                //result.originalData
                templateParams.formValues.groups

                var deletedIds = _.filter(result.originalData.groups,function(originalDataGroupId){

                    return templateParams.formValues.groups.indexOf(originalDataGroupId) == -1;

                });

                async.forEachSeries(deletedIds,function(deleteGroupId,doneEach){

                    // delete from user's history
                    historyModel.remove({ 
                        userId:_id,
                        chatId:deleteGroupId
                    }, function(err, deleteResult) {

                        if(err)
                            console.log(err);
                        
                        doneEach(null, result);
                        
                    });

                },function(err){

                    done(null,result);
                    
                });

                // send delete signal
                if(deletedIds){

                    // send block signal
                    SocketAPIHandler.emitToUser(_id,"delete_group",{
                        groupIds:deletedIds
                    });

                }

            }
        ],
        function(err, result) {
            
            if (err) {
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;

                if (templateParams.file) fs.unlink(templateParams.file.path, function() {});
                if (result.thumbnailPath) fs.unlink(result.thumbnailPath, function() {});

            } else {
                templateParams.successMessage = self.l10n('The user is successfully updated.');
            }

            templateParams.formValues.password = "";

            self.render(request, response, '/User/Edit', templateParams);
            
        });
        
    });
    

    router.get('/delete/:_id', checkUserAdmin, function(request,response){

        var _id = request.params._id;
        var baseUser = request.session.user;
        
        var templateParams = {
            page : "user-list",
            openMenu : "user",
            organizationAdmin: (baseUser.permission == Const.userPermission.organizationAdmin)
        };
        
        if(_.isEmpty(_id)) {
            
            response.redirect('/admin/user/list');  
            return;
            
        }
        
        var model = UserModel.get();
        
        async.waterfall([

            function(done) {

                self.getGroups(baseUser, GroupModel, Const.groupType.group, function(err, groupData) {
                    done(err, { groupList: groupData });
                });

            },
            function(result, done) {
                                
                self.getGroups(baseUser, GroupModel, Const.groupType.department, function(err, departmentData) {

                    result.departmentList = departmentData;
                    done(err, result);

                });

            },
            function(result, done){

                model.findOne({ _id: _id }, function(err, findResult) {
                    
                    if(!findResult) {
                        response.redirect('/admin/user/list');  
                        return;
                    }
                    
                    result.obj = findResult;
                    done(err, result);
                    
                });

            }
        ],
        function(err, result) {

            if (err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
            
            templateParams.formValues = result.obj;
            templateParams.formValues.groupList = result.groupList;
            templateParams.formValues.departmentList = result.departmentList;
            templateParams.formValues.password = "";

            // if permission not exist, assign subAdmin permission
            if (!templateParams.formValues.permission) templateParams.formValues.permission = Const.userPermission.subAdmin;

            templateParams.formValues.showPermission = (
                baseUser.permission == Const.userPermission.organizationAdmin &&
                result.obj.permission != Const.userPermission.organizationAdmin
            );
            
            self.render(request,response,'/User/Delete', templateParams);
            
        });
        
    });

    router.post('/delete/:_id', checkUserAdmin, function(request,response){

        var _id = request.params._id;
        var baseUser = request.session.user;
        
        var templateParams = {
            page : "user-list",
            openMenu : "user",
            organizationAdmin: (baseUser.permission == Const.userPermission.organizationAdmin)
        };
        
        if(_.isEmpty(_id)){
            
            response.redirect('/admin/user/list');  
            return;
            
        }

       if(_id != request.body._id){
            
            response.redirect('/admin/user/list');  
            return;
            
        }
        
        var model = UserModel.get();
        
        async.waterfall([
            
            function(done) {

                self.getGroups(baseUser, GroupModel, Const.groupType.group, function(err, groupData) {
                    done(err, { groupList: groupData });
                });

            },
            function(result, done) {
                                
                self.getGroups(baseUser, GroupModel, Const.groupType.department, function(err, departmentData) {

                    result.departmentList = departmentData;
                    done(err, result);

                });

            },
            function(result, done) {

                model.findOne({ _id: _id }, function(err,findResult) {
                    
                    if(!findResult) {
                        response.redirect('/admin/user/list');  
                        return;
                    }
                    
                    result.obj = findResult;
                    done(err, result);
                    
                });

            },
            function(result, done) {
                
                // if user is orgadmin, then delete user, else remove groups from user
                if (baseUser.permission == Const.userPermission.organizationAdmin) {

                    model.remove({ _id: _id }, function(err, deleteResult) {

                        fs.unlink(Config.uploadPath + "/" + result.obj.avatar.picture.nameOnServer, function() {});
                        fs.unlink(Config.uploadPath + "/" + result.obj.avatar.thumbnail.nameOnServer, function() {});
                        
                        done(err, result);

                    });
                    
                } else {

                    model.update(
                        { _id: _id },
                        { $pull: { groups: { $in: baseUser.groups } } },
                    function(err, updateUser) {

                        done(err, result);
         
                    });

                };
                
            },
            function(result, done) {

                // update organization disk usage
                if (baseUser.permission == Const.userPermission.organizationAdmin && result.obj.avatar.picture.size) {

                    var size = -(result.obj.avatar.picture.size + result.obj.avatar.thumbnail.size);

                    UpdateOrganizationDiskUsageLogic.update(baseUser.organizationId, size, (err, updateResult) => {
                        done(err, result);
                    });
                    
                } else {

                    done(null, result);

                }

            },
            function(result, done) {
            
                var modelGroup = GroupModel.get();

                // remove ($pull) current user in groups
                modelGroup.update(
                    { users: _id, organizationId: baseUser.organizationId },
                    { $pull: { users: _id } }, 
                    { multi: true }, 
                function(err, updateGroup) {

                    done(err, result);

                });     

            }
        ],
        function(err, result) {

            if (err) {
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
                
                templateParams.formValues = result.obj;
                templateParams.formValues.groupList = result.groupList;
                templateParams.formValues.departmentList = result.departmentList;
                templateParams.formValues.password = "";

                // if permission not exist, assign subAdmin permission
                if (!templateParams.formValues.permission) templateParams.formValues.permission = Const.userPermission.subAdmin;

                templateParams.formValues.showPermission = (
                    baseUser.permission == Const.userPermission.organizationAdmin &&
                    result.obj.permission != Const.userPermission.organizationAdmin
                );

                self.render(request, response, '/User/Delete', templateParams);

                return;
            }
            
            response.redirect('/admin/user/list?delete=1');
            
        });
        
    });
    
    router.get('/deleteAvatar', checkUserAdmin, function(request, response) {

        var _id = request.query._id;
        var pictureName = request.query.pictureName;
        var pictureSize = Number(request.query.pictureSize);
        var thumbnailName = request.query.thumbnailName;
        var thumbnailSize = Number(request.query.thumbnailSize);
        var uploadFilePath = request.query.uploadFilePath;
        
        if(_.isEmpty(_id)) {
            
            response.redirect('/admin/user/list');  
            return;
            
        }

        var model = UserModel.get();
        
        async.waterfall([
            
            function(done) {
                
                model.update({ _id: _id }, { $unset: { avatar: "" } }, function(errUpdate, updateResult) {

                    if (errUpdate) {
                        done(errUpdate, null);
                        return;
                    }

                    fs.unlink(Config.uploadPath + "/" + pictureName, function() {});
                    fs.unlink(Config.uploadPath + "/" + thumbnailName, function() {});
                    if (uploadFilePath) fs.unlink(uploadFilePath, function() {});
                                   
                    done(null, updateResult);
                }); 
                
            },
            function(result, done) {

                // update organization disk usage
                var size = -(pictureSize + thumbnailSize);

                UpdateOrganizationDiskUsageLogic.update(request.session.user.organizationId, size, (err, updateResult) => {
                    done(err, result);
                });

            }
        ],
        function(err, result) {

            if (err) console.log(err);
            response.redirect("/admin/user/edit/" + _id);

        });
        
    });

    router.get('/import', checkUserAdmin, function(request,response){

        var templateParams = {

        };

        self.render(request, response, '/User/Import', templateParams);

    });

    router.post('/import', checkUserAdmin, function(request,response){

        var baseUser = request.session.user;
        var modelUsers = UserModel.get();
        var modelOrganization = OrganizationModel.get();

        var templateParams = {
            
        };

        async.waterfall([(done) => {

                var form = new formidable.IncomingForm();
                form.uploadDir = Config.uploadPath;

                form.on('fileBegin', function(name, file) {
                    file.path = path.dirname(file.path) + "/" + Utils.getRandomString();
                });

                form.parse(request, function(err, fields, files) {
                    done(err, { file: files.file, formValues: fields });
                });

            },
            (result,done) => {

                if(!result.file.name){
                    done({
                        message : self.l10n('Please select a file.')
                    },result);

                    return;

                }
                
                self.parseImportFile(result.file,request.session.user,(err,data) => {

                    if(err){

                        done({
                            message: err.message,
                            errorList : err.errorList
                        },result);

                        return;
                    }

                    result.parsedResult = data;

                    done(null,result);

                });

                
            },
            (result,done) => {
                // check user limit

                // get user limit of organization
                modelOrganization.findOne({ _id: baseUser.organizationId }, (err, findResult) => {

                    result.maxUserNumber = findResult.maxUserNumber;

                    done(err,result);

                });
            },
            (result,done) => {
                // check user limit

                modelUsers.count({ organizationId: baseUser.organizationId }, (err, countResult) => {

                    result.userCount = countResult;
                    done(err, result);
                    
                });

            },
            (result,done) => {
                
                if(result.userCount > result.maxUserNumber){

                    done({
                        message : self.l10n('Number of users is exceed limit.')
                    },result);

                    return;

                }else{
                    
                    done(null, result);

                }

            },
            (result,done) => {
                
                // create users

                var userDataAry = result.parsedResult.objAry;
                var hasError = false;

                result.parsedResult.errorList.forEach((errorMess) => {

                    hasError = !_.isEmpty(errorMess);

                });

                if(hasError){
                    done(hasError,result);
                    return;
                }

                // check user id duplication
                async.eachOfSeries(userDataAry,(userData,index,doneEach) => {

                    NewUserLogic.create(
                        userData.name,
                        userData.sortName,
                        "",
                        userData.userid,
                        userData.password, 
                        userData.status, 
                        baseUser.organizationId, 
                        (userData.permission == 3) ? Const.userPermission.subAdmin : Const.userPermission.webClient, 
                        userData.groups,
                        null,
                    function(err, saveResult) {

                        doneEach(err, result);
                        
                    });


                },(err) => {

                    done(err,result);

                });

            }   
        ],
        function(err,result){

            if(err){
                templateParams.errorMessage = err.message;

                // generate line number

                templateParams.errorList = _.map(err.errorList,(mess,index) => {

                    return {
                        line: index + 1,
                        message: mess
                    }

                });

            } else {
                templateParams.successMessage = result.parsedResult.objAry.length + " user(s) have been imported.";
            }
            
            self.render(request, response, '/User/Import', templateParams);
        });

    });

    router.get('/devices/:_id', checkUserAdmin, function(request, response){

        var _id = request.params._id;
        var baseUser = request.session.user;

        var templateParams = {
            page : "user-list",
            openMenu : "user",
            organizationAdmin: (baseUser.permission == Const.userPermission.organizationAdmin)
        };

        if(_.isEmpty(_id)){
            
            response.redirect('/admin/user/list');  
            return;
            
        }
        
        var model = UserModel.get();
        var templateParams = {};

        async.waterfall([
            
            function(done) {
                
                var result = {};

                model.findOne({ _id: _id }, function(err, findResult) {
                    
                    if(!findResult) {
                        response.redirect('/admin/user/list');  
                        return;
                    }
                    
                    result.user = findResult;
                    done(err, result);
                    
                });
                
            },
            function(result, done) {
               
                done(null,result);

            },
            function(result, done) {

                done(null,result);

            }
        ],
        function(err, result){

            if (err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
            
            templateParams.devices = result.user.UUID;
            
            //templateParams.devices = _.filter(result.user.UUID,(row) => {
            //    return !_.isEmpty(row.UUID);    
            //});

            templateParams.userId = _id;
            self.render(request, response, '/User/Device', templateParams);

        });
        
    });

    router.get('/deleteDevice/:_id/:UUID', checkUserAdmin, function(request, response){

        var UUID = request.params.UUID;
        var _id = request.params._id;

        var baseUser = request.session.user;

        if(_.isEmpty(UUID)){
            
            response.redirect('/admin/user/list');  
            return;
            
        }
        
        if(_.isEmpty(_id)){
            
            response.redirect('/admin/user/list');  
            return;
            
        }

        var model = UserModel.get();
        var templateParams = {};

        async.waterfall([
            
            function(done) {
                
                var result = {};

                model.findOne({ _id: _id }, function(err, findResult) {
                    
                    if(!findResult) {
                        response.redirect('/admin/user/list');  
                        return;
                    }
                    
                    result.user = findResult;
                    done(err, result);
                    
                });
                
            },
            function(result, done) {
               
                var newUUIDList = _.filter(result.user.UUID, ( uuidObj ) => {

                    if(UUID != 'web'){
                        return uuidObj.UUID != UUID;
                    } else {
                        return !_.isEmpty(uuidObj.UUID);
                    }
                    

                });

                model.update(
                    {_id:_id},{
                    UUID: newUUIDList
                },function(err,updateResult){
                    
                    done(err,result);
                    
                });

            },
            function(result, done) {

                done(null,result);

            }
        ],
        function(err, result){

            if (err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
        
            response.redirect('/admin/user/devices/' + _id); 

        });
        
    });


    router.get('/blockDevice/:_id/:UUID', checkUserAdmin, function(request, response){

        var UUID = request.params.UUID;
        var _id = request.params._id;

        var baseUser = request.session.user;

        if(_.isEmpty(UUID)){
            
            response.redirect('/admin/user/list');  
            return;
            
        }
        
        if(_.isEmpty(_id)){
            
            response.redirect('/admin/user/list');  
            return;
            
        }

        var model = UserModel.get();
        var templateParams = {};

        async.waterfall([
            
            function(done) {
                
                var result = {};

                model.findOne({ _id: _id }, function(err, findResult) {
                    
                    if(!findResult) {
                        response.redirect('/admin/user/list');  
                        return;
                    }
                    
                    result.user = findResult;
                    done(err, result);
                    
                });
                
            },
            function(result, done) {
               
                var newUUIDList = _.map(result.user.UUID, ( uuidObj ) => {

                    if(uuidObj.UUID == UUID)
                        uuidObj.blocked = true;

                    return uuidObj

                });

                model.update(
                    {_id:_id},{
                    UUID: newUUIDList
                },function(err,updateResult){
                    
                    done(err,result);
                    
                });

            },
            function(result, done) {

                var UUIDObj = _.filter(result.user.UUID, ( uuidObj ) => {
                    return uuidObj.UUID == UUID;
                })[0];

                var lastLoginToken = UUIDObj.lastToken;

                // delete the token
                var tokenList = _.filter(result.user.token,(token) => {
                    return token.token != lastLoginToken;
                });

                model.update(
                    {_id:result.user._id},{
                    token: tokenList
                },function(err,updateResult){
                    
                    done(err,result);
                    
                });
            
            },
            function(result, done){

                // get socket id to send block signal
		        DatabaseManager.redisGet(Const.redisKeyUserId + result.user._id,function(err,value){
		            
                    result.socketIds = value;
                    
                    done(null,result)
                    
		        });

            },
            function(result, done){

                _.forEach(result.socketIds,function(socketInfo){
                    
                    // send block signal
                    SocketAPIHandler.emitToSocket(socketInfo.socketId,"device_blocked",{
                        UUID: UUID
                    });
                
                });

                done(null,result)

            }

        ],
        function(err, result){

            if (err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
        
            response.redirect('/admin/user/devices/' + _id); 

        });
        
    });


    router.get('/unblockDevice/:_id/:UUID', checkUserAdmin, function(request, response){

        var UUID = request.params.UUID;
        var _id = request.params._id;

        var baseUser = request.session.user;

        if(_.isEmpty(UUID)){
            
            response.redirect('/admin/user/list');  
            return;
            
        }
        
        if(_.isEmpty(_id)){
            
            response.redirect('/admin/user/list');  
            return;
            
        }

        var model = UserModel.get();
        var templateParams = {};

        async.waterfall([
            
            function(done) {
                
                var result = {};

                model.findOne({ _id: _id }, function(err, findResult) {
                    
                    if(!findResult) {
                        response.redirect('/admin/user/list');  
                        return;
                    }
                    
                    result.user = findResult;
                    done(err, result);
                    
                });
                
            },
            function(result, done) {
               
                var newUUIDList = _.map(result.user.UUID, ( uuidObj ) => {

                    if(uuidObj.UUID == UUID)
                        uuidObj.blocked = false;

                    return uuidObj

                });

                model.update(
                    {_id:_id},{
                    UUID: newUUIDList
                },function(err,updateResult){
                    
                    done(err,result);
                    
                });

            },
            function(result, done) {

                done(null,result);

            }
        ],
        function(err, result){

            if (err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
        
            response.redirect('/admin/user/devices/' + _id); 

        });
        
    });

    return router;
}

UserController.prototype.validation = function(values, isEdit) {
    
    var name = values.formValues.name;
    var userid = values.formValues.userid;
    var password = values.formValues.password;
    
    var file = values.file;

    var errorMessage = "";
    
    if(!isEdit){

        if(_.isEmpty(name)){
            
            errorMessage = this.l10n('Please input name.');
                
        } else if(_.isEmpty(userid)){
            
            errorMessage = this.l10n('Please input user id.');
            
        } else if(_.isEmpty(password)){
            
            errorMessage = this.l10n('Please input password.');
            
        } else if(!Const.REUsername.test(userid)){
            
            errorMessage = this.l10n('User id must contain only alphabet and number, and more than 6 characters.');
            
        } else if(!Const.REPassword.test(password)){
            
            errorMessage = this.l10n('Password must contain only alphabet and number, and more than 6 characters.');
            
        }  
            
    } else {
        

        if(_.isEmpty(name)){
            
            errorMessage = this.l10n('Please input name.');
                
        } else if(_.isEmpty(userid)){
            
            errorMessage = this.l10n('Please input user id.');
            
        } else if(!Const.REUsername.test(userid)){
            
            errorMessage = this.l10n('User id must contain only alphabet and number, and more than 6 characters.');
            
        } else if(!_.isEmpty(password) && !Const.REPassword.test(password)){
            
            errorMessage = this.l10n('Password must contain only alphabet and number, and more than 6 characters.');
            
        }  
        
    }
    
    if (file && _.isEmpty(errorMessage)) {

        if (file.type.search("image/") == -1) errorMessage = this.l10n('File must be image type.');  

    }

    return errorMessage;
    
}

UserController.prototype.numberOfUsersInOrganization = function(userModel, organizationId, callback) {
    
    // get count
    userModel.count({ organizationId: organizationId }, (err, countResult) => {

        callback(err, countResult);
        
    });
    
}

UserController.prototype.parseImportFile = function(file,baseUser,callBack){ 

    var self = this;
    var modelUsers = UserModel.get();

    async.waterfall([(done) => {

            var result = {

            };


            //var fileBuffer = fs.readFileSync(file.path);
            //var charsetMatch = detectCharacterEncoding(fileBuffer);
            //result.origTextData = encoding.convert(fileBuffer, "UTF-8","Shift_JIS").toString('UTF-8');

            var fileBuffer = fs.readFileSync(file.path);

            //文字コード判定
            var detectResult = jschardet.detect(fileBuffer);

            var regex = new RegExp('shift_jis|utf-8|ascii', "i");

            if(!detectResult.encoding.match(regex)){
                done({
                    message : "Failed to detect character encoding. ( Only UTF8, ShiftJIS and Ascii is allowed. )"
                },null);
                return;
            }

            //判定した文字コードからUTF-8に変換
            var iconv = new Iconv(detectResult.encoding,'UTF-8//TRANSLIT//IGNORE');
            result.origTextData = iconv.convert(fileBuffer).toString();

            done(null,result);

        },
        (result,done) => {

            csv.parse(result.origTextData, {comment: '#'}, function(err, output){
                
                if(err){
                    done({
                        message : err
                    },null);
                    return;
                }

                result.objAry = _.map(output,function(row){

                    return {
                        name     : row[0],
                        sortName : row[1],
                        userid : row[2],
                        password : row[3],
                        status : ( (row[4] == "1" )? 1 : 0 ),
                        groupnames : row[5],
                        departmentnames : row[6],
                        groups : [] , // here comes id of groups after processed,
                        permission : ( (row[7] == "2")? "3" : "1" )
                    }

                });

                done(null,result);
            });

        },
        (result,done) => {

            // simple validation
            var errorList = [];
            var hasError = false;

            result.objAry.forEach((row,index) => {

                var errorMessage = self.validation({
                    formValues: row},false);

                errorList[index] = errorMessage;

                if(errorMessage != "")
                    hasError = true;

            });

            if(hasError){
                done({
                    errorList : errorList
                },null);
                return;
            }

            done(null,result);

        },
        (result,done) => {

            result.errorList = [];
            var hasError = false;

            // check user id duplication
            async.eachOfSeries(result.objAry,(row,index,doneEach) => {

                var userId = row.userid;

               modelUsers.findOne({ 
                   userid: userId,
                   organizationId: baseUser.organizationId
                }, function(err, findResult) {
                    
                    if(findResult){
                        result.errorList[index] = self.l10n('The user id is already used.');
                        hasError = true;
                    }
                    
                    if(err){
                        result.errorList[index] = self.l10n('DB error occured while processing.');
                        hasError = true;
                    }

                    doneEach(null);

                });

            },(err) => {

                if(hasError){
                    done({
                        errorList : result.errorList
                    },null);
                    return;
                }

                done(null,result);

            });

        },
        (result,done) => {

            // data is clean, process groups
            var hasError = false;

            async.eachOfSeries(result.objAry,(row,index,doneEach) => {

                var groupNames = row.groupnames.split(',');
                
                async.each(groupNames,(groupName,doneEach2) => {

                    if(!_.isEmpty(groupName)){
                        var groupId = self.getOrCreateGroupByName(groupName,baseUser,Const.groupType.group,(err,newGroupId) => {
                            result.objAry[index].groups.push(newGroupId);
                            doneEach2(err);
                        });
                    } else {
                        doneEach2(null);
                    }

                },(err) => {

                    if(err)
                        result.errorList[index] = self.l10n('DB error occured while processing.');

                    doneEach(null);

                });

            },(err) => {

                done(hasError,result);

            });

        },
        (result,done) => {

            // data is clean, process departments
            var hasError = false;

            async.eachOfSeries(result.objAry,(row,index,doneEach) => {

                var groupNames = row.departmentnames.split(',');
                
                async.each(groupNames,(groupName,doneEach2) => {

                    if(!_.isEmpty(groupName)){
                        var groupId = self.getOrCreateGroupByName(groupName,baseUser,Const.groupType.department,(err,newGroupId) => {
                            result.objAry[index].groups.push(newGroupId);
                            doneEach2(err);
                        });
                    } else {
                        doneEach2(null);
                    }

                },(err) => {

                    if(err)
                        result.errorList[index] = self.l10n('DB error occured while processing.');

                    doneEach(null);

                });

            },(err) => {

                done(hasError,result);

            });
        },
        (result,done) => {

            done(null,result);

        }
    ],
    (err,result) => {

        callBack(err,result);

    });

}

UserController.prototype.getOrCreateGroupByName = function(groupName,baseUser,type,callBack){

    var self = this;
    var modelGroups = GroupModel.get();

    modelGroups.findOne({ 
        name: groupName,
        organizationId: baseUser.organizationId
    }, function(err, findResult) {
        
        if(findResult){

            callBack(err,findResult._id.toString());

        } else {

            var newGroup = {
                name: groupName,
                sortName: groupName,
                description: "",
                created: Utils.now(),
                organizationId: baseUser.organizationId,
                type: type
            }
            
            var group = new modelGroups(newGroup);

            group.save(function(err, saveResult){
                callBack(err,saveResult._id.toString());
            });

        }

    });

}

module["exports"] = new UserController();