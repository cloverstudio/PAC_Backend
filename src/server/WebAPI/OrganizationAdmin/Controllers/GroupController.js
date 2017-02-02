/** Called for URL /admin/group */

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

var GroupController = function(){
}

// extends from basecontroller
_.extend(GroupController.prototype, BackendBaseController.prototype);

GroupController.prototype.init = function(app){
    
    var self = this;

    router.get('/list', checkUserAdmin, function(request,response){
        
        var baseUser = request.session.user;
        var baseOrganization = request.session.organization;

        var page = request.query.page;
        if(!page)
            page = 1;
            
        var templateParams = {
            page : "group-list",
            openMenu : "group",
            maxGroupNumber: baseOrganization.maxGroupNumber
        };
        
        var model = GroupModel.get();
        var keyword = request.session.groupKeyword;
        var organizationId = request.session.user.organizationId;
        
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);

        var criteria = {};
        criteria.organizationId = organizationId;
        criteria.type = Const.groupType.group;

        if(!_.isEmpty(keyword)){
            
            criteria.name = new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i")
            
        }

        if (!organizationAdmin) {
            criteria._id = { $in: baseUser.groups };
        };

        async.waterfall([
            
            function(done){
                
                var result = {};
                
                model.find(criteria).
                    limit(Const.pagingRows).
                    skip( (page - 1 ) * Const.pagingRows).
                    sort({created:"asc"}).
                exec(function(err,findResult){
                   
                    result.list = findResult;
                    done(err, result);
                    
                });

            },
            function(result,done){
                
                // get count
                model.count(criteria,function(err,countResult){
                    
                    result.count = countResult;
                    done(err, result);
                    
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
            
            var listCountFrom = (result.count) ? Const.pagingRows * (page - 1) + 1 : result.count;
            var listCountTo = (Const.pagingRows * page > result.count) ? result.count : Const.pagingRows * page;
            
            templateParams.paging = {
                
                page : page,
                count : result.count,
                listCountFrom: listCountFrom,
                listCountTo : listCountTo,
                rows : Const.pagingRows,
                baseURL : "/admin/group/list?page="
                
            }
            
            if(request.query.delete){
                templateParams.successMessage = self.l10n('The group is successfully deleted.');
            }
            
            templateParams.keyword = keyword;
            templateParams.numberOfGroups = result.numberOfGroups;

            self.render(request, response, '/Group/List', templateParams);
            
        });

    });

    router.all('/search', checkUserAdmin, function(request,response){

        var templateParams = {
            page : "group-list",
            openMenu : "group"
        };
        
        var keyword = request.body.keyword;        
        
        request.session.groupKeyword = keyword;
            
        response.redirect('/admin/group/list');  
        
    });
    
    router.get('/add', checkUserAdmin, function(request,response){

        var templateParams = {
            page : "group-list",
            openMenu : "group"
        };

        self.render(request,response,'/Group/Add',templateParams);
        
    });
    
    router.post('/add', checkUserAdmin, function(request,response) {

        var baseUser = request.session.user;
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);
        var baseOrganization = request.session.organization;

        var templateParams = {
            page : "group-list",
            openMenu : "group"
        };

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

                var file = result.file;
                templateParams.formValues = result.formValues;

                if (uploadPathError) {
                    done(uploadPathError, result);
                    return;
                };

                var errorMessage = self.validation({ formValues: templateParams.formValues, fileValues: file }, false);
                
                if(!_.isEmpty(errorMessage)) {
                    templateParams.errorMessage = errorMessage;
                    self.render(request,response, '/Group/Add', templateParams);
                            
                    if (file) fs.unlink(file.path, function() {});

                    return;
                }

                // check duplication
                model.findOne({

                    name: Utils.getCIString(templateParams.formValues.name), 
                    organizationId: baseUser.organizationId,
                    type: Const.groupType.group

                    }, function(err, findResult) {

                    if(findResult) {
                        
                        templateParams.errorMessage = self.l10n('The group name is taken.');
                        self.render(request,response, '/Group/Add', templateParams);
                        
                        if (file) fs.unlink(file.path, function() {});

                        return;
                        
                    } else {
                        
                        done(err, result);
                        
                    }
                     
                });

            },
            function(result, done) {

                var file = result.file;
                
                self.numberOfGroupsInOrganization(model, baseUser.organizationId, (err, numberOfGroups) => {

                    if (numberOfGroups >= baseOrganization.maxGroupNumber) { 
                        
                        if (file) fs.unlink(file.path, function() {});

                        templateParams.errorMessage = self.l10n('You can\'t add more groups to this organization. Maximum number of groups/departments in this organization is ' + 
                            baseOrganization.maxGroupNumber + '.');

                        self.render(request, response, '/Group/Add', templateParams);
                        
                        return;
                        
                    } else {
                        
                        done(err, result);
                        
                    }

                });

            },
            function(result, done) {

                var file = result.file;
                var sortName = _.isEmpty(templateParams.formValues.sortName) ? templateParams.formValues.name.toLowerCase() : templateParams.formValues.sortName;
                var group = null;
                
                var data = {

                    name: templateParams.formValues.name,
                    sortName: sortName,
                    description: templateParams.formValues.description,
                    created: Utils.now(),
                    organizationId: baseUser.organizationId,
                    type: Const.groupType.group

                };

                if (!organizationAdmin) data.users = baseUser._id;

                if (file) {

                    easyImg.thumbnail({
                         src: file.path,
                         dst: path.dirname(file.path) + "/" + Utils.getRandomString(),
                         width: Const.thumbSize,
                         height: Const.thumbSize
                    }).then(
                        function(thumbnail) {

                            data.avatar = {

                                picture: {
                                    originalName: file.name,
                                    size: file.size,
                                    mimeType: file.type,
                                    nameOnServer: path.basename(file.path)
                                },
                                thumbnail: {
                                    originalName: file.name,
                                    size: thumbnail.size,
                                    mimeType: thumbnail.type,
                                    nameOnServer: thumbnail.name
                                }

                            }

                            result.thumbnailPath = thumbnail.path;
                            result.thumbnailSize = thumbnail.size;

                            group = new model(data);
                            // save to DB          
                            group.save(function(err, saveResult){

                                result.newGroupId = saveResult._id;
                                done(err, result);
                            
                            });

                        },
                        function (err) {
                            done(err, result);
                        }
                    );

                } else {

                    group = new model(data);
                    // save to DB          
                    group.save(function(err, saveResult){

                        result.newGroupId = saveResult._id;
                        done(err, result);
                    
                    });

                } 
                             
            },
            function(result, done) {

                // update organization disk usage
                if (result.file) {

                    var size = result.file.size + result.thumbnailSize;

                    UpdateOrganizationDiskUsageLogic.update(baseUser.organizationId, size, (err, updateResult) => {
                        done(err, result);
                    });
                    
                } else {

                    done(null, result);

                }

            },
            function(result, done) {

                if (organizationAdmin) {
                    done(null, result);
                    return;
                };

                // add new group to login subadmin user
                var userModel = UserModel.get();

                userModel.update(
                    { _id: baseUser._id },
                    { $push: { groups: result.newGroupId } },
                function(err, updateResult) {

                    done(err, result);

                });     

            },
            function(result, done) {

                if (organizationAdmin) {
                    done(null, result);
                    return;
                };

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

                if (result.file) fs.unlink(result.file.path, function() {});
                if (result.thumbnailPath) fs.unlink(result.thumbnailPath, function() {});

            } else {
                templateParams.successMessage = self.l10n('New group is created.');
            }
            
            self.render(request,response, '/Group/Add', templateParams);
                    
        });

    });
    

    router.get('/edit/:_id', checkUserAdmin, function(request,response) {

        var _id = request.params._id;
        
        var templateParams = {
            page : "group-list",
            openMenu : "group"
        };
        
        if(_.isEmpty(_id)){
            
            response.redirect('/admin/group/list');  
            return;
            
        }
        
        var model = GroupModel.get();
        
        async.waterfall([
            
            function(done) {
                
                var result = {};
                
                model.findOne({ _id: _id },function(err,findResult){
                    
                    if(!findResult){
                        response.redirect('/admin/group/list');  
                        return;
                    }
                    
                    result.obj = findResult;
                    done(err,result)
                    
                });

            }
        ],
        function(err,result){

            if(err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
 
            templateParams.formValues = result.obj;

            self.render(request, response, '/Group/Edit', templateParams);
            
        });
        
    });

    router.post('/edit/:_id', checkUserAdmin, function(request, response) {

        var _id = request.params._id;

        var templateParams = {
            page : "group-list",
            openMenu : "group"
        };
        
        if(_.isEmpty(_id)){
            
            response.redirect('/admin/group/list');  
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

                var file = result.file;
                templateParams.formValues = result.formValues;

                if (uploadPathError) {
                    done(uploadPathError, result);
                    return;
                };

                if (templateParams.formValues.deleteAvatar) {
                    model.findOne({ _id: _id }, { avatar: true }, function(errFind, findResult) {
                        if (findResult) {

                            templateParams.formValues.avatar = findResult.avatar;

                            var url = "";

                            if (file) 
                                url = '/admin/group/deleteAvatar?' + 
                                    "_id=" + _id + 
                                    "&pictureName=" + templateParams.formValues.avatar.picture.nameOnServer + 
                                    "&pictureSize=" + templateParams.formValues.avatar.picture.size + 
                                    "&thumbnailName=" + templateParams.formValues.avatar.thumbnail.nameOnServer + 
                                    "&thumbnailSize=" + templateParams.formValues.avatar.thumbnail.size + 
                                    "&uploadFilePath=" + file.path
                            else
                                url = '/admin/group/deleteAvatar?' + 
                                    "_id=" + _id + 
                                    "&pictureName=" + templateParams.formValues.avatar.picture.nameOnServer + 
                                    "&pictureSize=" + templateParams.formValues.avatar.picture.size + 
                                    "&thumbnailName=" + templateParams.formValues.avatar.thumbnail.nameOnServer + 
                                    "&thumbnailSize=" + templateParams.formValues.avatar.thumbnail.size

                            response.redirect(url);  

                        } else  {
                            response.redirect('/admin/group/list');
                        }
                    });
                    
                    return;

                } else {
                    model.findOne({ _id: _id }, { avatar: true }, function(errFind, findResult) {
                        if (findResult) {
                            templateParams.formValues.avatar = findResult.avatar;
                        }
                    });
                };   

                // basic validation
                var errorMessage = self.validation({ formValues: templateParams.formValues, fileValues: file }, true);
                
                if(!_.isEmpty(errorMessage)) {
                    templateParams.errorMessage = errorMessage;
                    self.render(request,response, '/Group/Edit', templateParams);
                            
                    if (file) fs.unlink(file.path, function() {});

                    return;
                }

                // check duplication
                model.findOne({
                    
                    $and : [
                        { 
                            name: Utils.getCIString(templateParams.formValues.name), 
                            organizationId: request.session.user.organizationId,
                            type: Const.groupType.group
                        },
                        { _id : { $ne : _id } }
                    ]}, function(err, findResult) {
                    
                    if(findResult){
                        
                        templateParams.errorMessage = self.l10n('The group name is taken.');
                        self.render(request,response, '/Group/Edit', templateParams);

                        if (file) fs.unlink(file.path, function() {});

                        return;
                    }
                    
                    done(err, result)
                    
                });

            },
            function(result, done) {

                var file = result.file;

                // get original data
                model.findOne({_id:_id}, function(err, findResult) {
                    
                    if (!findResult) {
                        response.redirect('/admin/group/list'); 

                        if (file) fs.unlink(file.path, function() {});

                        return;
                    }
                    
                    result.originalData = findResult;
                    done(err, result);
                    
                });

            },
            function (result, done) {

                var file = result.file;
                var sortName = _.isEmpty(templateParams.formValues.sortName) ? templateParams.formValues.name.toLowerCase() : templateParams.formValues.sortName;
                
                var updateParams = {

                    name: templateParams.formValues.name,
                    sortName: sortName,
                    description: templateParams.formValues.description

                };

                if (file) {

                    easyImg.thumbnail({
                         src: file.path,
                         dst: path.dirname(file.path) + "/" + Utils.getRandomString(),
                         width: Const.thumbSize,
                         height: Const.thumbSize
                    }).then(
                        function(thumbnail) {

                            updateParams.avatar = {

                                picture: {
                                    originalName: file.name,
                                    size: file.size,
                                    mimeType: file.type,
                                    nameOnServer: path.basename(file.path)
                                },
                                thumbnail: {
                                    originalName: file.name,
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
                if (result.file) {

                    var size = 0;

                    if (result.originalData.avatar.picture.size) {

                        var originalSize = result.originalData.avatar.picture.size + result.originalData.avatar.thumbnail.size;
                        var newSize = result.file.size + result.thumbnailSize;

                        size = newSize - originalSize;

                    } else {

                        size = result.file.size + result.thumbnailSize;

                    }

                    UpdateOrganizationDiskUsageLogic.update(request.session.user.organizationId, size, (err, updateResult) => {
                        done(err, result);
                    });
                    
                } else {

                    done(null, result);

                }

            }
        ],
        function(err, result) {
            
            if(err) {
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;

                if (result.file) fs.unlink(result.file.path, function() {});
                if (result.thumbnailPath) fs.unlink(result.thumbnailPath, function() {}); 

            } else {
                templateParams.successMessage = self.l10n('The group is successfully updated.');
            }

            if (result.file) {
                model.findOne({ _id: _id }, { avatar: true }, function(errFind, findResult) {
                    if (findResult) {
                        templateParams.formValues.avatar = findResult.avatar;
                    }
                });
            }

            self.render(request,response, '/Group/Edit', templateParams);
            
        });

    });
    
    router.get('/delete/:_id', checkUserAdmin, function(request,response){

        var _id = request.params._id;
        
        var templateParams = {
            page : "group-list",
            openMenu : "group"
        };
        
        if(_.isEmpty(_id)){
            
            response.redirect('/admin/group/list');  
            return;
            
        }
        
        var model = GroupModel.get();
        
        async.waterfall([
            
            function(done) {
                
                var result = {};
                
                model.findOne({_id:_id},function(err,findResult){
                    
                    if(!findResult){
                        response.redirect('/admin/group/list');  
                        return;
                    }
                    
                    result.obj = findResult;
                    done(err,result)
                    
                });

            }
        ],
        function(err,result){

            if(err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
 
            templateParams.formValues = result.obj;
            
            self.render(request,response, '/Group/Delete', templateParams);
            
        });
        
    });


    router.post('/delete/:_id', checkUserAdmin, function(request, response) {

        var _id = request.params._id;

        var baseUser = request.session.user;
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);

        var templateParams = {
            page : "group-list",
            openMenu : "group"
        };
        
        var model = GroupModel.get();
        var historyModel = HistoryModel.get();

        var uploadPathError = self.checkUploadPath();

        async.waterfall([
            
            function(done) {
                
                model.findOne({ _id: _id }, function(err, findResult) {
                    
                    if(!findResult){
                        response.redirect('/admin/group/list');  
                        return;
                    }
                    
                    done(err, { obj: findResult });
                    
                });

            },
            function(result, done) {

                if (uploadPathError) {
                    done(uploadPathError, result);
                    return;
                };

                model.remove({ _id: _id }, function(err, deleteResult) {

                    fs.unlink(Config.uploadPath + "/" + result.obj.avatar.picture.nameOnServer, function() {});
                    fs.unlink(Config.uploadPath + "/" + result.obj.avatar.thumbnail.nameOnServer, function() {});
                    
                    done(err, result);

                });
                
            },
            function(result, done) {

                // update organization disk usage
                if (result.obj.avatar.picture.size) {

                    var size = -(result.obj.avatar.picture.size + result.obj.avatar.thumbnail.size);

                    UpdateOrganizationDiskUsageLogic.update(baseUser.organizationId, size, (err, updateResult) => {
                        done(err, result);
                    });
                    
                } else {

                    done(null, result);

                }

            },
            function(result, done) {

                // remove history
                historyModel.remove({ chatId: _id }, function(err, deleteResult) {

                    done(err, result);
                    
                });

            },
            function(result, done) {

                if (organizationAdmin) {
                    done(null, result);
                    return;
                };

                // add new group to login subadmin user
                var userModel = UserModel.get();

                userModel.update(
                    { _id: baseUser._id },
                    { $pull: { groups: _id } },
                function(err, updateResult) {

                    done(err, result);

                });     

            },
            function(result, done) {

                if (organizationAdmin) {
                    done(null, result);
                    return;
                };
                
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

                self.render(request,response, '/Group/Delete', templateParams);

                return;
            }
          
            response.redirect('/admin/group/list?delete=1');

        });

    });
    
    router.get('/deleteAvatar', checkUserAdmin, function(request, response){

        var _id = request.query._id;
        var pictureName = request.query.pictureName;
        var pictureSize = Number(request.query.pictureSize);
        var thumbnailName = request.query.thumbnailName;
        var thumbnailSize = Number(request.query.thumbnailSize);
        var uploadFilePath = request.query.uploadFilePath;
        
        if(_.isEmpty(_id)) {
            
            response.redirect('/admin/group/list');  
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
            response.redirect("/admin/group/edit/" + _id);

        });
        
    });
    


    // USER LIST
    //******************************************************
    router.get('/userlist/:groupId', checkUserAdmin, function(request, response) {
        
        var groupId = request.params.groupId;
        var baseUser = request.session.user;
        
        var page = request.query.page;
        if(!page)
            page = 1;

        var templateParams = {
            page : "group-list",
            openMenu : "group",
            groupId: groupId
        };
        
        var model = UserModel.get();

        var keyword = request.session.groupMembersKeyword;
        var organizationId = baseUser.organizationId;
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);
        
        var criteria = {};
        criteria.organizationId = organizationId;
        criteria.groups = groupId;

        if (!organizationAdmin) {
            criteria._id = { $ne: baseUser._id };
        }

        if(!_.isEmpty(keyword)) {            
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
                    done(null,result);
                    
                });
                
            },
            function(result, done) {

                GroupModel.get().findOne({ _id: groupId }, { name: true }, function(err, findResult) {
                    
                    if (findResult) templateParams.groupName = findResult.name
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
                baseURL : "/admin/group/userlist/" + groupId + "?page="
                
            }
            
            if(request.query.delete){
                templateParams.successMessage = self.l10n('The user is successfully deleted.');
            }
            
            templateParams.keyword = keyword;

            self.render(request,response, '/Group/UserList', templateParams);
            
        });

    });

     
    router.all('/userlist/search/:groupId', checkUserAdmin, function(request, response) {
        
        var groupId = request.params.groupId;

        var templateParams = {
            page : "group-list",
            openMenu : "group"
        };

        var keyword = request.body.keyword;        
        
        request.session.groupMembersKeyword = keyword;
            
        response.redirect('/admin/group/userlist/' + groupId);  
        
    });

    router.get('/userlist/add/:groupId', checkUserAdmin, function(request, response) {

        var baseUser = request.session.user;
        var groupId = request.params.groupId;

        var templateParams = {
            page : "group-list",
            openMenu : "group",
            groupId: groupId,
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

            templateParams.formValues.groups = [groupId];
            templateParams.formValues.defaultGroups = [groupId];

            if (!templateParams.organizationAdmin) {
                templateParams.formValues.groups = _.union(baseUser.defaultDepartments, [groupId]);                
                templateParams.formValues.defaultGroups = _.union(baseUser.defaultDepartments, [groupId]);
            };

            self.render(request, response, '/Group/UserAdd', templateParams);

        });
        
    });
    
    router.post('/userlist/add/:groupId', checkUserAdmin, function(request, response) {

        var baseUser = request.session.user;
        var groupId = request.params.groupId;

        var templateParams = {
            page : "group-list",
            openMenu : "group",
            groupId: groupId,
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

                templateParams.formValues.groups = _.union(_.flattenDeep([templateParams.formValues.groups]), [groupId]);
                templateParams.formValues.defaultGroups = [groupId];

                if (!templateParams.organizationAdmin) {

                    if (_.isEmpty(templateParams.formValues.groups))
                        templateParams.formValues.groups = _.union(baseUser.defaultDepartments, [groupId]);
                    else                        
                        templateParams.formValues.groups = _.union(_.flattenDeep([templateParams.formValues.groups]), baseUser.defaultDepartments, [groupId]);
                    
                    templateParams.formValues.defaultGroups = _.union(baseUser.defaultDepartments, [groupId]);

                };

                var errorMessage = self.userValidation({ formValues: templateParams.formValues, file: templateParams.file }, false);
        
                if(!_.isEmpty(errorMessage)) {

                    templateParams.formValues.password = "";
                    
                    if (templateParams.file) fs.unlink(templateParams.file.path, function() {});

                    templateParams.errorMessage = errorMessage;
                    self.render(request,response, '/Group/UserAdd', templateParams);
                    
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
                        self.render(request, response, '/Group/UserAdd', templateParams);
                        
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
            
            self.render(request, response, '/Group/UserAdd', templateParams);

        });
        
    });

    router.get('/userlist/delete/:groupId/:userId', checkUserAdmin, function(request, response) {

        var groupId = request.params.groupId;
        var userId = request.params.userId;
        var baseUser = request.session.user;
        
        var templateParams = {
            page : "group-list",
            openMenu : "group",
            groupId: groupId,
            organizationAdmin: (baseUser.permission == Const.userPermission.organizationAdmin)
        };
        
        if(_.isEmpty(userId)) {
            
            response.redirect('/admin/group/userlist/' + groupId);  
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
                                
                model.findOne({ _id: userId }, function(err, findResult) {
                    
                    if(!findResult) {
                        response.redirect('/admin/group/userlist/' + groupId);  
                        return;
                    }
                    
                    result.obj = findResult;
                    done(err, result);
                    
                });

            }
        ],
        function(err, result) {

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

            self.render(request,response, '/Group/UserDelete', templateParams);
            
        });
        
    });

    router.post('/userlist/delete/:groupId/:userId', checkUserAdmin, function(request, response) {
        
        var groupId = request.params.groupId;
        var userId = request.params.userId;
        var baseUser = request.session.user;

        var templateParams = {
            page : "group-list",
            openMenu : "group",
            groupId: groupId,
            organizationAdmin: (baseUser.permission == Const.userPermission.organizationAdmin)
        };
        
        if(_.isEmpty(userId)){
            
            response.redirect('/admin/group/userlist/' + groupId);  
            return;
            
        }

       if(userId != request.body._id){
            
            response.redirect('/admin/group/userlist/' + groupId);  
            return;
            
        }
        
        var model = UserModel.get();
        var historyModel = HistoryModel.get();
        
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
                    
                    if(!findResult) {
                        response.redirect('/admin/group/userlist/' + groupId);  
                        return;
                    }
                    
                    result.obj = findResult;
                    done(err, result);
                    
                });

            },
            function(result, done) {

                // if user is orgadmin, then delete user, else remove groups from user
                /*if (baseUser.permission == Const.userPermission.organizationAdmin) {

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

                };*/

                model.update(
                    { _id: userId },
                    { $pull: { groups: groupId } },
                function(err, updateUser) {

                    done(err, result);
        
                });

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
                    { _id: groupId },
                    { $pull: { users: userId } }, 
                    { multi: true }, 
                function(err, updateResult) {

                    done(err, result);

                });     

            },
            function(result, done) {
            
                // delete from user's history
                historyModel.remove({ 
                    userId:userId,
                    chatId:groupId
                }, function(err, deleteResult) {

                    if(err)
                        console.log(err);
                    
                    done(null, result);
                    
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

                self.render(request,response, '/Group/UserDelete', templateParams);

                return;
            }
            
            response.redirect('/admin/group/userlist/' + groupId + '?delete=1');
            
        });
        
    });
    


    // ADD USERS LIST
    //******************************************************
    router.get('/userlistadd/:groupId', checkUserAdmin, (request, response) => {
        
        var groupId = request.params.groupId;
        var baseUser = request.session.user;
        
        var page = request.query.page;
        if(!page)
            page = 1;

        var templateParams = {
            page : "group-list",
            openMenu : "group",
            groupId: groupId
        };
        
        var model = UserModel.get();

        var keyword = request.session.groupMembersAddKeyword;

        var organizationId = baseUser.organizationId;
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);
        
        var criteria = {};
        criteria.organizationId = organizationId;
        
        // don't show current user
        criteria._id = { $ne: baseUser._id };

        if (organizationAdmin) {
            criteria.groups = { $ne: groupId };
        } else {
            criteria.$and = [
                { groups: { $ne: groupId } }, 
                { groups : { $in : baseUser.groups } }
            ];
        }

        if (!_.isEmpty(keyword)) {  
            criteria.name = new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i");  
        }

        async.waterfall([
            
            (done) => {
                
                var result = {};                
                
                model.find(criteria).
                    limit(Const.pagingRows).
                    skip( (page - 1 ) * Const.pagingRows).
                    sort({ created: "asc" }).
                exec((err, findResult) => {
                   
                    result.list = findResult;
                    done(err, result);
                    
                });

            },
            (result, done) => {
                
                // get count
                model.count(criteria, (err, countResult) => {
                    
                    result.count = countResult;
                    done(err, result);
                    
                });
                
            },
            (result, done) => {

                GroupModel.get().findOne({ _id: groupId }, { name: true }, (err, findResult) => {
                    
                    if (findResult) templateParams.groupName = findResult.name
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
                baseURL : "/admin/group/userlistadd/" + groupId + "?page="
                
            }
            
            if (request.query.add) {
                templateParams.successMessage = self.l10n('The user is successfully added.');
            }
            
            templateParams.keyword = keyword;

            self.render(request,response, '/Group/UserListAdd', templateParams);
            
        });

    });

     
    router.all('/userlistadd/search/:groupId', checkUserAdmin, (request, response) => {
        
        var groupId = request.params.groupId;

        var templateParams = {
            page : "group-list",
            openMenu : "group"
        };

        var keyword = request.body.keyword;        
        
        request.session.groupMembersAddKeyword = keyword;
            
        response.redirect('/admin/group/userlistadd/' + groupId);  
        
    });

    router.get('/userlistadd/add/:groupId/:userId', checkUserAdmin, (request, response) => {
        
        var groupId = request.params.groupId;
        var userId = request.params.userId;

        self.addUserToGroup(groupId, userId, (err) => {

            if (err)
                response.redirect('/admin/group/userlistadd/' + groupId + '?err=' + err);
            else
                response.redirect('/admin/group/userlistadd/' + groupId + '?add=1');
            
        });
        
    });
    //******************************************************
    // USER LIST


    return router;
}

GroupController.prototype.validation = function(values, isEdit){

    var name = values.formValues.name;

    if(_.isEmpty(name)) return this.l10n('Please input name.');

    if (values.fileValues) {
        var mimeType = values.fileValues.type;
        if (mimeType.search("image/") == -1) return this.l10n('File must be image type.');  
    }
    
}

GroupController.prototype.userValidation = function(values, isEdit) {
    
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

GroupController.prototype.numberOfGroupsInOrganization = function(groupModel, organizationId, callback) {
    
    // get count
    groupModel.count({ organizationId: organizationId }, (err, countResult) => {

        callback(err, countResult);
        
    });
    
}

module["exports"] = new GroupController();