/**  Called for URL /admin/department */

var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');
var JSON = require('JSON2');
var async = require('async');
var validator = require('validator');
 
var Const = require("../../../lib/consts");
var Config = require("../../../lib/init");
var BackendBaseController = require("./BackendBaseController");
var DatabaseManager = require('../../../lib/DatabaseManager');
var Utils = require('../../../lib/utils');

var GroupModel = require('../../../Models/Group');
var UserModel = require('../../../Models/User');
var HistoryModel = require('../../../Models/History');

var checkUserAdmin = require('../../../lib/auth.js').checkUserAdmin;

var formidable = require('formidable');
var fs = require('fs');
var easyImg = require('easyimage');

var PermissionLogic = require('../../../Logics/Permission');
var NewUserLogic = require('../../../Logics/NewUser');
var UpdateOrganizationDiskUsageLogic = require("../../../Logics/UpdateOrganizationDiskUsage");

var DepartmentController = function(){
}

// extends from basecontroller
_.extend(DepartmentController.prototype, BackendBaseController.prototype);

DepartmentController.prototype.init = function(app){
    
    var self = this;

    router.get('/list', checkUserAdmin, function(request,response){

        var baseOrganization = request.session.organization;
            
        var templateParams = {
            page : "department-list",
            openMenu : "department",
            maxGroupNumber: baseOrganization.maxGroupNumber
        };
        
        var model = GroupModel.get();
        var baseUser = request.session.user;
        var organizationId = baseUser.organizationId;
        
        async.waterfall([
            
            function(done) {
                
                var result = {};
                var criteria = {};

                criteria.organizationId = organizationId;
                criteria.type = Const.groupType.department;
                if (baseUser.permission != Const.userPermission.organizationAdmin) criteria._id = { $in: baseUser.groups };

                model.find(criteria).sort({ sortName: "asc" }).exec(function(err, findResult) {
                   
                    result.list = findResult;
                    done(null, result);
                    
                });

            },
            function(result, done) {

                self.numberOfGroupsInOrganization(model, baseUser.organizationId, (err, numberOfGroups) => {

                    result.numberOfGroups = numberOfGroups;
                    done(err, result);

                });
                
            }
        ],
        function(err,result){

            if(err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
            else
                templateParams.list = result.list;
        
            if(request.query.delete) {
                templateParams.successMessage = self.l10n('The department is successfully deleted.');
            }
            
            templateParams.numberOfGroups = result.numberOfGroups;

            self.render(request, response, '/Department/List', templateParams);
            
        });

    });

    
    router.get('/add', checkUserAdmin, function(request, response) {

        var templateParams = {
            page : "department-list",
            openMenu : "department"
        };

        var baseUser = request.session.user;

        self.getGroups(baseUser, GroupModel, Const.groupType.department, function(err, departmentData) {

            templateParams.formValues = { 
                departmentList: departmentData, 
                organizationAdmin: (baseUser.permission == Const.userPermission.organizationAdmin) 
            };

            self.render(request, response, '/Department/Add', templateParams);

        });

    });
    
    router.post('/add', checkUserAdmin, function(request,response) {

        var templateParams = {
            page : "department-list",
            openMenu : "department"
        };

        var model = GroupModel.get();
        var uploadPathError = self.checkUploadPath();
        var baseUser = request.session.user;

        async.waterfall([
            
            function(done) {
               
                var form = new formidable.IncomingForm();
                form.uploadDir = Config.uploadPath;

                form.on('fileBegin', function(name, file) {

                    file.path = path.dirname(file.path) + "/" + Utils.getRandomString();

                });

                form.onPart = function(part) {

                    if (part.filename) {

                        if (!uploadPathError) form.handlePart(part);

                    } else if (part.filename != "") { 

                        form.handlePart(part);

                    }

                }

                form.parse(request, function(err, fields, files) {

                    done(err, { file: files.avatar, formValues: fields });

                });

            },
            function(result, done) {

                templateParams.formValues = result.formValues;
                templateParams.formValues.organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);
                
                templateParams.file = result.file;

                if (uploadPathError) {
                    done(uploadPathError, result);
                    return;
                };

                self.validation(request, response, model, templateParams, false, function(err) {
                    done(err, result);
                });

            },
            function(result, done) {

                var sortName = _.isEmpty(templateParams.formValues.sortName) ? templateParams.formValues.name.toLowerCase() : templateParams.formValues.sortName;
                var department = null;
                
                var data = {

                    name: templateParams.formValues.name,
                    sortName: sortName,
                    description: templateParams.formValues.description,
                    created: Utils.now(),
                    organizationId: baseUser.organizationId,
                    parentId: templateParams.formValues.parentId,
                    type: Const.groupType.department
                    
                };

                if (templateParams.file) {

                    easyImg.thumbnail({
                         src: templateParams.file.path,
                         dst: path.dirname(templateParams.file.path) + "/" + Utils.getRandomString(),
                         width: Const.thumbSize,
                         height: Const.thumbSize
                    }).then(
                        function(thumbnail) {

                            data.avatar = {

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

                            department = new model(data);
                            // save to DB          
                            department.save(function(err, saveResult){

                                done(err, result);
                            
                            });

                        },
                        function (err) {
                            done(err, result);
                        }
                    );

                } else {

                    department = new model(data);
                    // save to DB          
                    department.save(function(err, saveResult){

                        done(err, result);
                    
                    });

                }

            },
            function(result, done) {

                // update organization disk usage
                if (templateParams.file) {

                    var size = templateParams.file.size + result.thumbnailSize;

                    UpdateOrganizationDiskUsageLogic.update(baseUser.organizationId, size, (err, updateResult) => {
                        done(err, result);
                    });
                    
                } else {

                    done(null, result);

                }

            },
            function(result, done) {

                // refresh user session data
                PermissionLogic.getUserBySessionUserId(baseUser._id, function(user) {

                    if (user) {
                        request.session.user = user;
                        baseUser = request.session.user;
                    };
                    
                    done(null, result);
                    
                });

            }
        ],
        function(err, result) {

            if (err) {
                if (err.clientError)
                    templateParams.errorMessage = self.l10n(err.clientError);
                else
                    templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;

                if (templateParams.file) fs.unlink(templateParams.file.path, function() {});
                if (result.thumbnailPath) fs.unlink(result.thumbnailPath, function() {});

            } else {
                templateParams.successMessage = self.l10n('New department is created.');
            }
            
            self.getGroups(baseUser, GroupModel, Const.groupType.department, function(err, departmentData) {

                templateParams.formValues.departmentList = departmentData;

                self.render(request,response, '/Department/Add', templateParams);

            });      

        });

    });
    
    router.get('/edit/:_id', checkUserAdmin, function(request,response) {

        var _id = request.params._id;
        var baseUser = request.session.user;
        
        var templateParams = {
            page : "department-list",
            openMenu : "department"
        };
        
        if(_.isEmpty(_id)){
            
            response.redirect('/admin/department/list');  
            return;
            
        }
        
        var model = GroupModel.get();
        
        async.waterfall([
            
            function(done) {
                
                var result = {};
                
                model.findOne({ _id: _id }, function(err, findResult) {
                    
                    if(!findResult){
                        response.redirect('/admin/department/list');  
                        return;
                    }
                    
                    result.obj = findResult;
                    done(err,result);
                    
                });

            },
            function(result, done) {
                
                self.getGroups(baseUser, GroupModel, Const.groupType.department, function(err, departmentData) {
                    
                    var departmentList = departmentData;

                    // remove current department
                    departmentList = _.reject(departmentList, { _id: DatabaseManager.toObjectId(_id) });
 
                    removeChildDepartments(_.filter(departmentList, { parentId: _id }));

                    function removeChildDepartments(departments) {

                        _.forEach(departments, function(department) { 

                            departmentList = _.reject(departmentList, { _id: department._id });

                            removeChildDepartments(_.filter(departmentList, { parentId: department._id.toString() }));

                        });

                    };

                    result.departmentList = departmentList;
                    done(err, result);

                });
                
            }
        ],
        function(err, result) {

            if(err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
 
            templateParams.formValues = result.obj;
            templateParams.formValues.departmentList = result.departmentList;
            templateParams.formValues.organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);

            self.render(request, response, '/Department/Edit', templateParams);
            
        });
        
    });

    router.post('/edit/:_id', checkUserAdmin, function(request, response) {

        var _id = request.params._id;
        var baseUser = request.session.user;

        var templateParams = {
            page : "department-list",
            openMenu : "department"
        };
        
        if(_.isEmpty(_id)){
            
            response.redirect('/admin/department/list');  
            return;
            
        }

        var model = GroupModel.get();
        var uploadPathError = self.checkUploadPath();

        async.waterfall([

            function(done) {
               
                var form = new formidable.IncomingForm();
                form.uploadDir = Config.uploadPath;

                form.on('fileBegin', function(name, file) {

                    file.path = path.dirname(file.path) + "/" + Utils.getRandomString();

                });

                form.onPart = function(part) {

                    if (part.filename) {

                        if (!uploadPathError) form.handlePart(part);

                    } else if (part.filename != "") { 

                        form.handlePart(part);

                    }

                }

                form.parse(request, function(err, fields, files) {

                    done(err, { file: files.avatar, formValues: fields });

                });

            },
            function(result, done) {

                self.getGroups(baseUser, GroupModel, Const.groupType.department, function(err, departmentData) {
                    
                    var departmentList = departmentData;

                    // remove current department
                    departmentList = _.reject(departmentList, { _id: DatabaseManager.toObjectId(_id) });
 
                    removeChildDepartments(_.filter(departmentList, { parentId: _id }));

                    function removeChildDepartments(departments) {

                        _.forEach(departments, function(department) { 

                            departmentList = _.reject(departmentList, { _id: department._id });

                            removeChildDepartments(_.filter(departmentList, { parentId: department._id.toString() }));

                        });

                    };

                    result.departmentList = departmentList;
                    done(err, result);

                });
            
            },
            function(result, done) {

                templateParams.formValues = result.formValues;
                templateParams.formValues.departmentList = result.departmentList;
                templateParams.formValues.organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);
                
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
                                url = '/admin/department/deleteAvatar?' + 
                                    "_id=" + _id + 
                                    "&pictureName=" + templateParams.formValues.avatar.picture.nameOnServer + 
                                    "&pictureSize=" + templateParams.formValues.avatar.picture.size + 
                                    "&thumbnailName=" + templateParams.formValues.avatar.thumbnail.nameOnServer + 
                                    "&thumbnailSize=" + templateParams.formValues.avatar.thumbnail.size + 
                                    "&uploadFilePath=" + templateParams.file.path
                            else
                                url = '/admin/department/deleteAvatar?' + 
                                    "_id=" + _id + 
                                    "&pictureName=" + templateParams.formValues.avatar.picture.nameOnServer + 
                                    "&pictureSize=" + templateParams.formValues.avatar.picture.size + 
                                    "&thumbnailName=" + templateParams.formValues.avatar.thumbnail.nameOnServer + 
                                    "&thumbnailSize=" + templateParams.formValues.avatar.thumbnail.size

                            response.redirect(url);  

                        } else  {
                            response.redirect('/admin/department/list');
                        }

                    });
                    
                    return;

                } else {

                    model.findOne({ _id:_id }, { avatar: true }, function(errFind, findResult) {

                        if (findResult) {
                            templateParams.formValues.avatar = findResult.avatar;
                        }

                        done(errFind, result);

                    });

                };

            },
            function(result, done) {

                self.validation(request, response, model, templateParams, true, function(err) {
                    done(err, result);
                });

            },
            function(result, done) {

                // get original data
                model.findOne({_id:_id}, function(err, findResult) {
                    
                    if (!findResult) {
                        response.redirect('/admin/department/list'); 

                        if (templateParams.file) fs.unlink(templateParams.file.path, function() {});

                        return;
                    }
                    
                    result.originalData = findResult;
                    done(err, result);
                    
                });

            },
            function (result, done) {

                var sortName = _.isEmpty(templateParams.formValues.sortName) ? templateParams.formValues.name.toLowerCase() : templateParams.formValues.sortName;
                
                var updateParams = {

                    name: templateParams.formValues.name,
                    sortName: sortName,
                    description: templateParams.formValues.description,
                    parentId: (_.isEmpty(templateParams.formValues.parentId)) ? "" : templateParams.formValues.parentId

                };

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
                    
                                done(err, result);

                                fs.unlink(Config.uploadPath + "/" + result.originalData.avatar.picture.nameOnServer, function() {});
                                fs.unlink(Config.uploadPath + "/" + result.originalData.avatar.thumbnail.nameOnServer, function() {});
                                
                            });

                        },
                        function (err) {
                            done(err, result);
                        }
                    );

                } else {

                    model.update({ _id: _id }, updateParams, function(err, updateResult) {
                    
                        done(err, result);
                        
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

            }
        ],
        function(err, result) {
            
            if(err) {
                if (err.clientError)
                    templateParams.errorMessage = self.l10n(err.clientError);
                else
                    templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;

                if (templateParams.file) fs.unlink(templateParams.file.path, function() {});
                if (result.thumbnailPath) fs.unlink(result.thumbnailPath, function() {}); 

            } else {
                templateParams.successMessage = self.l10n('The department is successfully updated.');
            }

            self.render(request, response, '/Department/Edit', templateParams);
            
        });

    });
    
    router.get('/delete/:_id', checkUserAdmin, function(request,response){

        var _id = request.params._id;
        var baseUser = request.session.user;
        
        var templateParams = {
            page : "department-list",
            openMenu : "department"
        };
        
        if(_.isEmpty(_id)){
            
            response.redirect('/admin/department/list');  
            return;
            
        }
        
        var model = GroupModel.get();
        
        async.waterfall([
            
            function(done) {
                
                var result = {};
                
                model.findOne({_id:_id},function(err,findResult){
                    
                    if(!findResult){
                        response.redirect('/admin/department/list');  
                        return;
                    }
                    
                    result.obj = findResult;
                    done(err,result)
                    
                });

            },
            function(result, done) {

                self.getGroups(baseUser, GroupModel, Const.groupType.department, function(err, departmentData) {

                    result.departmentList = departmentData;
                    done(err, result);

                });
            
            }
        ],
        function(err,result) {

            if(err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
 
            templateParams.formValues = result.obj;
            templateParams.formValues.departmentList = result.departmentList;
            
            self.render(request,response, '/Department/Delete', templateParams);
            
        });
        
    });


    router.post('/delete/:_id', checkUserAdmin, function(request, response) {

        var _id = request.params._id;
        var baseUser = request.session.user;
        
        var templateParams = {
            page : "department-list",
            openMenu : "department"
        };
        
        var model = GroupModel.get();
        var historyModel = HistoryModel.get();
        
        var uploadPathError = self.checkUploadPath();

        async.waterfall([
            
            function(done) {
                
                model.findOne({ _id: _id }, function(err, findResult) {
                    
                    if(!findResult){
                        response.redirect('/admin/department/list');  
                        return;
                    }
                    
                    done(err, { obj: findResult });
                    
                });

            },
            function(result, done) {

                self.getGroups(baseUser, GroupModel, Const.groupType.department, function(err, departmentData) {

                    result.departmentList = departmentData;
                    done(err, result);

                });
            
            },
            function(result, done) {

                model.find({ 

                    organizationId: baseUser.organizationId, 
                    type: Const.groupType.department 

                }, { avatar: true, parentId: true }, function(err, findResult) {

                    result.list = findResult;
                    done(err, result);

                });
            
            },
            function(result, done) {

                var departmentList = result.list;

                var parent = _.filter(departmentList, { _id: DatabaseManager.toObjectId(_id) });
                var removeDepartmentList = [];

                result.removeDepartmentList = getDepartments(parent);

                function getDepartments(data) {

                    _.forEach(data, function(value, index) { 

                        removeDepartmentList.push(value);
                        getDepartments(_.filter(departmentList, { parentId: value._id.toString() }));

                    });

                    return removeDepartmentList;
                };

                done(null, result);

            },
            function(result, done) {

                if (uploadPathError) {
                    done(uploadPathError, result);
                    return;
                };

                var removeDepartmentList = result.removeDepartmentList;

                model.remove({ _id: { $in: _.pluck(removeDepartmentList, "_id") } }, function(err, deleteResult) {
                    
                    var fileSize = 0;

                    _.forEach(removeDepartmentList, function(value, index) { 

                        fs.unlink(Config.uploadPath + "/" + value.avatar.picture.nameOnServer, function() {});
                        fs.unlink(Config.uploadPath + "/" + value.avatar.thumbnail.nameOnServer, function() {});
                        
                        if (value.avatar.picture.size) 
                            fileSize += value.avatar.picture.size + value.avatar.thumbnail.size;

                    });

                    result.fileSize = fileSize;
                    done(err, result);
                                        
                });
                
            },
            function(result, done) {

                // update organization disk usage
                if (result.fileSize) {

                    UpdateOrganizationDiskUsageLogic.update(baseUser.organizationId, -result.fileSize, (err, updateResult) => {
                        done(err, result);
                    });
                    
                } else {

                    done(null, result);

                }

            },
            function(result, done) {

                // remove history
                historyModel.remove({ chatId: { $in: _.pluck(result.removeDepartmentList, "_id") } }, function(err, deleteResult) {

                    done(err, result);

                });

            },
            function(result, done) {

                // refresh user session data
                PermissionLogic.getUserBySessionUserId(baseUser._id, function(user) {

                    if (user) request.session.user = user;
                    done(null, result);
                    
                });

            }
        ],
        function(err, result) {

            if (err) {

                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;

                templateParams.formValues = result.obj;
                templateParams.formValues.departmentList = result.departmentList;

                self.render(request,response, '/Department/Delete', templateParams);

                return;
            }
          
            response.redirect('/admin/department/list?delete=1');

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
            
            response.redirect('/admin/department/list');  
            return;
            
        }
        var model = GroupModel.get();
        
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
            response.redirect("/admin/department/edit/" + _id);

        });
        
    });
    


    // USER LIST
    //******************************************************
    router.get('/userlist/:departmentId', checkUserAdmin, function(request, response) {
        
        var departmentId = request.params.departmentId;
        var baseUser = request.session.user;
        
        var page = request.query.page;
        if(!page)
            page = 1;

        var templateParams = {
            page : "department-list",
            openMenu : "department",
            departmentId: departmentId
        };
        
        var model = UserModel.get();

        var keyword = request.session.departmentMembersKeyword;
        var organizationId = baseUser.organizationId;
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);
        
        var criteria = {};
        criteria.organizationId = organizationId;
        criteria.groups = departmentId;

        if (!organizationAdmin) {
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
                exec(function(err, findResult) {
                   
                    result.list = findResult;
                    done(null, result);
                    
                });

            },
            function(result, done) {
                
                // get count
                model.count(criteria, function(err, countResult) {
                    
                    result.count = countResult;
                    done(null, result);
                    
                });
                
            },
            function(result, done) {

                GroupModel.get().findOne({ _id: departmentId }, { name: true }, function(err, findResult) {
                    
                    if (findResult) templateParams.departmentName = findResult.name
                    done(err, result);

                });
                
            }
        ], 
        function(err, result) {

            if(err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
            else
                templateParams.list = result.list;
            
            var listCountFrom = (result.count) ? Const.pagingRows * (page - 1) + 1 : result.count;
            var listCountTo = (Const.pagingRows * page > result.count) ? result.count : Const.pagingRows * page;

            templateParams.paging = {
                
                page : page,
                count : result.count,
                listCountFrom: listCountFrom,
                listCountTo : listCountTo,
                rows : Const.pagingRows,
                baseURL : "/admin/department/userlist/" + departmentId + "?page="
                
            }
            
            if(request.query.delete){
                templateParams.successMessage = self.l10n('The user is successfully deleted.');
            }
            
            templateParams.keyword = keyword;

            self.render(request,response, '/Department/UserList', templateParams);
            
        });

    });

     
    router.all('/userlist/search/:departmentId', checkUserAdmin, function(request, response) {
        
        var departmentId = request.params.departmentId;

        var templateParams = {
            page : "department-list",
            openMenu : "department"
        };

        var keyword = request.body.keyword;        
        
        request.session.departmentMembersKeyword = keyword;
            
        response.redirect('/admin/department/userlist/' + departmentId);  
        
    });

    router.get('/userlist/add/:departmentId', checkUserAdmin, function(request, response) {

        var baseUser = request.session.user;
        var departmentId = request.params.departmentId;

        var templateParams = {
            page : "department-list",
            openMenu : "department",
            departmentId: departmentId,
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

            templateParams.formValues.groups = [departmentId];
            templateParams.formValues.defaultGroups = [departmentId];

            if (!templateParams.organizationAdmin) {
                templateParams.formValues.groups = _.union(baseUser.defaultDepartments, [departmentId]);                
                templateParams.formValues.defaultGroups = _.union(baseUser.defaultDepartments, [departmentId]);
            };

            self.render(request, response, '/Department/UserAdd', templateParams);

        });
        
    });
    
    router.post('/userlist/add/:departmentId', checkUserAdmin, function(request, response) {

        var baseUser = request.session.user;
        var departmentId = request.params.departmentId;

        var templateParams = {
            page : "group-list",
            openMenu : "group",
            departmentId: departmentId,
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

                templateParams.formValues.groups = _.union(_.flattenDeep([templateParams.formValues.groups]), [departmentId]);
                templateParams.formValues.defaultGroups = [departmentId];

                if (!templateParams.organizationAdmin) {

                    if (_.isEmpty(templateParams.formValues.groups))
                        templateParams.formValues.groups = _.union(baseUser.defaultDepartments, [departmentId]);
                    else                        
                        templateParams.formValues.groups = _.union(_.flattenDeep([templateParams.formValues.groups]), baseUser.defaultDepartments, [departmentId]);
                    
                    templateParams.formValues.defaultGroups = _.union(baseUser.defaultDepartments, [departmentId]);

                };

                var errorMessage = self.userValidation({ formValues: templateParams.formValues, file: templateParams.file }, false);
        
                if(!_.isEmpty(errorMessage)) {

                    templateParams.formValues.password = "";
                    
                    if (templateParams.file) fs.unlink(templateParams.file.path, function() {});

                    templateParams.errorMessage = errorMessage;
                    self.render(request,response, '/Department/UserAdd', templateParams);
                    
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
                        self.render(request, response, '/Department/UserAdd', templateParams);
                        
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
            
            self.render(request, response, '/Department/UserAdd', templateParams);

        });
        
    });

    router.get('/userlist/delete/:departmentId/:userId', checkUserAdmin, function(request, response) {

        var departmentId = request.params.departmentId;
        var userId = request.params.userId;
        var baseUser = request.session.user;
        
        var templateParams = {
            page : "department-list",
            openMenu : "department",
            departmentId: departmentId,
            organizationAdmin: (baseUser.permission == Const.userPermission.organizationAdmin)
        };
        
        if(_.isEmpty(userId)) {
            
            response.redirect('/admin/department/userlist/' + departmentId);  
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
                                
                model.findOne({ _id: userId }, function(err, findResult){
                    
                    if(!findResult){
                        response.redirect('/admin/department/userlist/' + departmentId);  
                        return;
                    }
                    
                    result.obj = findResult;
                    done(err, result);
                    
                });

            }
        ],
        function(err,result) {

            if(err)
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

            self.render(request,response,'/Department/UserDelete', templateParams);
            
        });
        
    });

    router.post('/userlist/delete/:departmentId/:userId', checkUserAdmin, function(request, response) {
        
        var departmentId = request.params.departmentId;
        var userId = request.params.userId;
        var baseUser = request.session.user;

        var templateParams = {
            page : "department-list",
            openMenu : "department",
            departmentId: departmentId,
            organizationAdmin: (baseUser.permission == Const.userPermission.organizationAdmin)
        };
        
        if(_.isEmpty(userId)){
            
            response.redirect('/admin/department/userlist/' + departmentId);  
            return;
            
        }

       if(userId != request.body._id){
            
            response.redirect('/admin/department/userlist/' + departmentId);  
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
                                
                model.findOne({ _id: userId }, function(err, findResult){
                    
                    if(!findResult){
                        response.redirect('/admin/department/userlist/' + departmentId);  
                        return;
                    }
                    
                    result.obj = findResult;
                    done(err, result);
                    
                });

            },
            function(result, done) {
                
                // if user is orgadmin, then delete user, else remove groups from user
                if (baseUser.permission == Const.userPermission.organizationAdmin) {

                    model.remove({ _id: userId }, function(err, deleteResult) {

                        fs.unlink(Config.uploadPath + "/" + result.obj.avatar.picture.nameOnServer, function() {});
                        fs.unlink(Config.uploadPath + "/" + result.obj.avatar.thumbnail.nameOnServer, function() {});

                        done(err, result);                        

                    });
                
                } else {

                    model.update(
                        { _id: userId },
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
                    { users: userId, organizationId: baseUser.organizationId },
                    { $pull: { users: userId } }, 
                    { multi: true }, 
                function(err, updateResult) {

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

                self.render(request, response, '/Department/UserDelete', templateParams);

                return;
            }
            
            response.redirect('/admin/department/userlist/' + departmentId + '?delete=1');
            
        });
        
    });
    


    // ADD USERS LIST
    //******************************************************
    router.get('/userlistadd/:departmentId', checkUserAdmin, (request, response) => {
        
        var departmentId = request.params.departmentId;
        var baseUser = request.session.user;
        
        var page = request.query.page;
        if(!page)
            page = 1;

        var templateParams = {
            page : "department-list",
            openMenu : "department",
            departmentId: departmentId
        };
        
        var userModel = UserModel.get();

        var keyword = request.session.departmentMembersAddKeyword;
        
        async.waterfall([
            
            (done) => {
                
                PermissionLogic.getAboveDepartments(baseUser.organizationId, departmentId, (departmentIds) => {

                    done(null, { departmentIds: departmentIds });

                });

            },
            (result, done) => {           
                
                var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);
                var criteria = {};

                criteria.organizationId = baseUser.organizationId;
                
                // don't show current user
                criteria._id = { $ne: baseUser._id };

                if (organizationAdmin) {
                    criteria.groups = { $nin: result.departmentIds };
                } else {
                    criteria.$and = [
                        { groups: { $nin: result.departmentIds } }, 
                        { groups : { $in : baseUser.groups } }
                    ];
                }

                if (!_.isEmpty(keyword)) {  
                    criteria.name = new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i");  
                }

                userModel.find(criteria).
                    limit(Const.pagingRows).
                    skip( (page - 1 ) * Const.pagingRows).
                    sort({ created: "asc" }).
                exec((err, findResult) => {
                    
                    result.list = findResult;
                    result.criteria = criteria;
                    done(err, result);
                    
                });

            },
            (result, done) => {
                
                // get count
                userModel.count(result.criteria, (err, countResult) => {
                    
                    result.count = countResult;
                    done(err, result);
                    
                });
                
            },
            (result, done) => {

                GroupModel.get().findOne({ _id: departmentId }, { name: true }, (err, findResult) => {
                    
                    if (findResult) templateParams.departmentName = findResult.name
                    done(err, result);

                });
                
            }
        ], 
        (err, result) => {

            if (err) {
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
            } else {
                if (request.query.err) templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + request.query.err; 
                templateParams.list = result.list;
            }
            
            var listCountFrom = (result.count) ? Const.pagingRows * (page - 1) + 1 : result.count;
            var listCountTo = (Const.pagingRows * page > result.count) ? result.count : Const.pagingRows * page;

            templateParams.paging = {
                
                page : page,
                count : result.count,
                listCountFrom: listCountFrom,
                listCountTo : listCountTo,
                rows : Const.pagingRows,
                baseURL : "/admin/department/userlistadd/" + departmentId + "?page="
                
            }
            
            if (request.query.add) {
                templateParams.successMessage = self.l10n('The user is successfully added.');
            }
            
            templateParams.keyword = keyword;

            self.render(request,response, '/Department/UserListAdd', templateParams);
            
        });

    });

     
    router.all('/userlistadd/search/:departmentId', checkUserAdmin, (request, response) => {
        
        var departmentId = request.params.departmentId;

        var templateParams = {
            page : "department-list",
            openMenu : "department"
        };

        var keyword = request.body.keyword;        
        
        request.session.departmentMembersAddKeyword = keyword;
            
        response.redirect('/admin/department/userlistadd/' + departmentId);  
        
    });

    router.get('/userlistadd/add/:departmentId/:userId', checkUserAdmin, (request, response) => {
        
        var departmentId = request.params.departmentId;
        var userId = request.params.userId;

        self.addUserToGroup(departmentId, userId, (err) => {

            if (err)
                response.redirect('/admin/department/userlistadd/' + departmentId + '?err=' + err);
            else
                response.redirect('/admin/department/userlistadd/' + departmentId + '?add=1');
            
        });

    });
    //******************************************************
    // USER LIST


    return router;
}

DepartmentController.prototype.validation = function(request, response, model, templateParams, isEdit, callback) {

    var errorMessage = "";

    var formValues = templateParams.formValues;
    var file = templateParams.file;

    var baseOrganization = request.session.organization;
    var baseUser = request.session.user;
    
    var self = this;

    async.waterfall([

        function(done) {

           if(_.isEmpty(formValues.name)) { 

                errorMessage = 'Please input name.';

            } else if (file) {

                if (file.type.search("image/") == -1) errorMessage = 'File must be image type.';  

            }

            done(errorMessage);

        },
        function(done) {

            var query = {
                name: Utils.getCIString(formValues.name), 
                organizationId: request.session.user.organizationId, 
                type: Const.groupType.department
            };

            if (isEdit) query._id = { $ne : formValues._id };

            // check duplication
            model.findOne(query, function(err, findResult) {

                if (findResult) errorMessage = 'The department name is taken.';
                
                done(errorMessage);

            });

        },
        function(done) {
            
            if (!isEdit) {
                
                self.numberOfGroupsInOrganization(model, baseUser.organizationId, (err, numberOfGroups) => {

                    if (err) {
                        done(err);
                        return;
                    }

                    if (numberOfGroups >= baseOrganization.maxGroupNumber) { 
                        
                        errorMessage = 'You can\'t add more departments to this organization. Maximum number of groups/departments in this organization is ' + 
                            baseOrganization.maxGroupNumber + '.';

                    }                
                    
                    done(errorMessage);    

                });

            } else {

                done(errorMessage);

            }

        }
    ],
    function(err) {

        if (err) 
            callback({ clientError: err });
        else
            callback(null);

    });

}

DepartmentController.prototype.userValidation = function(values, isEdit) {
    
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

DepartmentController.prototype.numberOfGroupsInOrganization = function(groupModel, organizationId, callback) {
    
    // get count
    groupModel.count({ organizationId: organizationId }, (err, countResult) => {

        callback(err, countResult);
        
    });
    
}

module["exports"] = new DepartmentController();