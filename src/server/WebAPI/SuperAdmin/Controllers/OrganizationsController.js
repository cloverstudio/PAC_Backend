/** Called for URL /owner/organization */

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

var OrganizationModel = require('../../../Models/Organization');
var UserModel = require('../../../Models/User');
var GroupModel = require('../../../Models/Group');
var RoomModel = require('../../../Models/Room');

var checkUserOwner = require('../../../lib/auth.js').checkUserOwner;

var NewOrganizationLogic = require('../../../Logics/NewOrganization');
var UpdateOrganizationDiskUsageLogic = require("../../../Logics/UpdateOrganizationDiskUsage");

var formidable = require('formidable');
var fs = require('fs');
var easyImg = require('easyimage');

var OrganizationsController = function(){
}

// extends from basecontroller
_.extend(OrganizationsController.prototype,BackendBaseController.prototype);

OrganizationsController.prototype.init = function(app){
    
    var self = this;

    router.get('/list', checkUserOwner, function(request,response) {
        
        var page = request.query.page;
        if(!page)
            page = 1;
            
        var templateParams = {
            page : "organization-list",
            openMenu : "organization"
        };
        
        var model = OrganizationModel.get();
        var userModel = UserModel.get();
        var groupModel = GroupModel.get();
        var roomModel = RoomModel.get();

        var keyword = request.session.organizationKeyword;
        var disabledStatus = request.session.organizationDisabledStatus;
        
        var criteria = {};
        criteria.status = !disabledStatus;
                
        if(!_.isEmpty(keyword)){      
            criteria['$or'] = {
                name: new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i"),
                email: new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i")
            }              
        }
        
        async.waterfall([
            
            (done) => {
                
                var result = {};                            

                model.find(criteria).
                    limit(Const.pagingRows).
                    skip((page - 1 ) * Const.pagingRows).
                    sort({sortName:"asc"}).
                exec((err, findResult) => {

                    result.organizations = findResult;
                    done(err, result);
                    
                });

            },
            (result, done) => {
                
                // get count
                model.count(criteria, function(err, countResult) {
                    
                    result.count = countResult;
                    done(null,result);
                    
                });
                
            },
            // get users
            (result, done) => {

                userModel.find({ organizationId: { $in: _.pluck(result.organizations, "_id") } }, (err, findResult) => {

                    result.users = findResult;
                    done(err, result);
                    
                });

            },
            // get groups count
            (result, done) => {

                groupModel.find({ organizationId: { $in: _.pluck(result.organizations, "_id") } }, (err, findResult) => {

                    result.groups = findResult;
                    done(err, result);
                    
                });

            },
            // get rooms count
            (result, done) => {

                roomModel.find({ owner: { $in: _.pluck(result.users, "_id") } }, (err, findResult) => {

                    result.rooms = findResult;
                    done(err, result);
                    
                });

            },
            // loop through organizations
            (result, done) => {

                _.forEach(result.organizations, (organization) => { 

                    organization.userCount = _.filter(result.users, { organizationId: organization._id.toString() }).length;
                    organization.groupCount = _.filter(result.groups, { organizationId: organization._id.toString() }).length;

                    var roomCount = 0;

                    _.forEach(_.filter(result.users, { organizationId: organization._id.toString() }), (user) => { 

                        roomCount += _.filter(result.rooms, { owner: user._id.toString() }).length;

                    });

                    organization.roomCount = roomCount;

                    if (!organization.diskUsage)
                        organization.diskUsage = 0;

                    var diskUsage = (organization.diskUsage / Const.gigabyteToByteMultiplier).toFixed(2);
                    var diskQuota = organization.diskQuota.toFixed(2);

                    organization.disk = { 
                        diskUsage: (organization.diskUsage / Const.gigabyteToByteMultiplier).toFixed(2),
                        diskQuota: organization.diskQuota.toFixed(2)
                    };

                });
                
                result.list = result.organizations;

                done(null, result);

            }
        ],
        (err,result) => {

            if (err)
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
                baseURL : "/owner/organization/list?page="
                
            }

            templateParams.keyword = keyword;
            templateParams.disabledStatus = disabledStatus;
            
            self.render(request,response,'/Organization/List',templateParams);
            
        });

    });

    router.all('/search', checkUserOwner, function(request,response){

        var templateParams = {
            page : "organization-list",
            openMenu : "organization"
        };
        
        var keyword = request.body.keyword;        
        var disabledStatus = request.body.disabledStatus;        
        
        request.session.organizationKeyword = keyword;
        request.session.organizationDisabledStatus = disabledStatus;
            
        response.redirect('/owner/organization/list');  
        
    });
    
    router.get('/add', checkUserOwner, function(request,response){

        var templateParams = {
            page : "organization-list",
            openMenu : "organization"
        };

        // default value status = enabled
        templateParams.formValues = { status: 1 };

        self.render(request,response,'/Organization/Add',templateParams);
        
    });
    
    router.post('/add', checkUserOwner, function(request,response){

        var templateParams = {
            page : "organization-list",
            openMenu : "organization"
        };
        
        var model = OrganizationModel.get();
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

                    done(err, { file: files.file, formValues: fields });

                });

            },
            function(result, done) {
                
                templateParams.formValues = result.formValues;                
                templateParams.file = result.file;

                if (uploadPathError) {
                    done(uploadPathError, result);
                    return;
                };

                var errorMessage = self.validation({ formValues: templateParams.formValues, file: templateParams.file }, false);
        
                if (!_.isEmpty(errorMessage)) {
                    
                    templateParams.formValues.password = "";

                    templateParams.errorMessage = errorMessage;
                    self.render(request,response,'/Organization/Add',templateParams);
                    
                    if (templateParams.file) fs.unlink(templateParams.file.path, function() {});

                    return;
                }

                // check duplication
                model.findOne({ organizationId: Utils.getCIString(templateParams.formValues.organizationId) }, function(err, findResult) {

                    if (findResult) {
                        
                        templateParams.formValues.password = "";

                        templateParams.errorMessage = self.l10n('The organization ID is taken.');
                        self.render(request,response,'/Organization/Add',templateParams);
                        
                        if (templateParams.file) fs.unlink(templateParams.file.path, function() {});
                        
                        return;
                        
                    } else { 
                        
                        done(err, result);
                        
                    }
                     
                });
                
            },
            function(result, done) {

                if (!_.isEmpty(templateParams.formValues.email)) {

                    var signupUserURL = Config.protocol + request.headers.host + "/signup/" + templateParams.formValues.organizationId;
                    var adminURL = Config.protocol + request.headers.host + 
                        "/admin/signin?organizationId=" + templateParams.formValues.organizationId + 
                        "&username=" + templateParams.formValues.userid;
                    var webClientURL = Config.protocol + request.headers.host;

                    var newLine = "<br/>";            

                    var body = self.l10n("Regards,") + newLine + newLine + 
                        self.l10n("Thank you for your registration on Spika For Business.") + newLine + newLine + newLine + 
                        self.l10n("Your account details:") + newLine + newLine + 
                        self.l10n("Organization: ") + templateParams.formValues.organizationId + newLine + 
                        self.l10n("Username: ") + templateParams.formValues.username + newLine + 
                        self.l10n("Userid: ") + templateParams.formValues.userid + newLine + 
                        self.l10n("Password: ") + templateParams.formValues.password + newLine + newLine + 
                        self.l10n("Admin login: ") + "<a href='" + adminURL + "'>" + adminURL + "</a>" + newLine +
                        self.l10n("Web Client login: ") + "<a href='" + webClientURL + "'>" + webClientURL + "</a>" + newLine + newLine + 
                        self.l10n("Signup user: ") + "<a href='" + signupUserURL + "'>" + signupUserURL + "</a>" + newLine + newLine + newLine + newLine +
                        self.l10n("Please keep this email for future reference.")

                    Utils.sendEmail(templateParams.formValues.email, self.l10n("Spika for business signup"), body, true, (err, info) => {
                        
                        done(err, result);
                    
                    });        

                } else {

                    done(null, result);

                }         

            },
            function(result, done) {
                
                NewOrganizationLogic.create(
                    templateParams.formValues.organizationId, 
                    templateParams.formValues.userid, 
                    templateParams.formValues.password, 
                    templateParams.formValues.username, 
                    templateParams.formValues.name, 
                    templateParams.formValues.sortName, 
                    templateParams.formValues.email, 
                    templateParams.formValues.maxUserNumber, 
                    templateParams.formValues.maxGroupNumber, 
                    templateParams.formValues.maxRoomNumber, 
                    templateParams.formValues.diskQuota, 
                    templateParams.formValues.status, 
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
                templateParams.successMessage = self.l10n('New organization is created.');
            }
            
            templateParams.formValues.password = "";

            self.render(request, response, '/Organization/Add', templateParams);
                    
        });

    });
    

    router.get('/edit/:_id', checkUserOwner, function(request,response){

        var _id = request.params._id;
        
        var templateParams = {
            page : "organization-list",
            openMenu : "organization"
        };
        
        if (_.isEmpty(_id)) {
            
            response.redirect('/owner/organization/list');  
            return;
            
        }
        
        var model = OrganizationModel.get();
        var userModel = UserModel.get();
        
        async.waterfall([
            
            function(done){
                
                var result = {};
                
                model.findOne({ _id: _id },function(err,findResult){
                    
                    if(!findResult){
                        response.redirect('/owner/organization/list');  
                        return;
                    }
                    
                    result.obj = findResult;
                    done(err, result);
                    
                });

            },
            function(result, done) {
                
                userModel.findOne({ 
                    organizationId: _id, 
                    permission: Const.userPermission.organizationAdmin 
                }, { name:true,userid: true, password: true }, function(err, findResult) {
                    
                    if(!findResult){
                        response.redirect('/owner/organization/list');  
                        return;
                    }
                    
                    result.obj.username = findResult.name;
                    result.obj.userid = findResult.userid;
                    result.obj.password = findResult.password;

                    done(err, result);
                    
                });

            }
        ],
        function(err, result) {

            if(err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
 
            templateParams.formValues = result.obj;
            
            templateParams.formValues.password = "";
            
            self.render(request,response,'/Organization/Edit',templateParams);
            
        });
        
    });

    router.post('/edit/:_id', checkUserOwner, function(request,response){

        var _id = request.params._id;

        var templateParams = {
            page : "organization-list",
            openMenu : "organization"
        };
        
        if(_.isEmpty(_id)){            
            response.redirect('/owner/organization/list');  
            return;            
        }
        
        var model = OrganizationModel.get();
        var userModel = UserModel.get();
        var groupModel = GroupModel.get();
        var roomModel = RoomModel.get();
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

                    done(err, { file: files.file, formValues: fields });

                });

            },
            function(result, done) {

                templateParams.formValues = result.formValues;                
                templateParams.file = result.file;

                if (uploadPathError) {
                    done(uploadPathError, result);
                    return;
                };

                if (templateParams.formValues.deleteLogo) {
                    model.findOne({ _id: _id }, { logo: true }, function(errFind, findResult) {
                        if (findResult) {

                            templateParams.formValues.logo = findResult.logo;

                            var url = "";

                            if (templateParams.file) 
                                url = '/owner/organization/deleteLogo?' + 
                                    "_id=" + _id + 
                                    "&pictureName=" + templateParams.formValues.logo.picture.nameOnServer + 
                                    "&pictureSize=" + templateParams.formValues.logo.picture.size + 
                                    "&thumbnailName=" + templateParams.formValues.logo.thumbnail.nameOnServer + 
                                    "&thumbnailSize=" + templateParams.formValues.logo.thumbnail.size + 
                                    "&uploadFilePath=" + templateParams.file.path
                            else
                                url = '/owner/organization/deleteLogo?' + 
                                    "_id=" + _id + 
                                    "&pictureName=" + templateParams.formValues.logo.picture.nameOnServer + 
                                    "&pictureSize=" + templateParams.formValues.logo.picture.size + 
                                    "&thumbnailName=" + templateParams.formValues.logo.thumbnail.nameOnServer + 
                                    "&thumbnailSize=" + templateParams.formValues.logo.thumbnail.size

                            response.redirect(url);  

                        } else  {
                            response.redirect('/owner/organization/list');
                        }
                    });
                    
                    return;

                } else {
                    model.findOne({ _id: _id }, { logo: true }, function(errFind, findResult) {
                        
                        if (findResult) {
                            templateParams.formValues.logo = findResult.logo;
                        }

                        done(errFind, result);

                    });
                };   

            },
            function(result, done) {

                var errorMessage = self.validation({ formValues: templateParams.formValues, file: templateParams.file }, true);
        
                if (!_.isEmpty(errorMessage)) {
                    
                    templateParams.formValues.password = "";

                    templateParams.errorMessage = errorMessage;
                    self.render(request, response, '/Organization/Edit', templateParams);
                    
                    if (templateParams.file) fs.unlink(templateParams.file.path, function() {});

                    return;
                }

                // check duplication
                model.findOne({
                    
                    organizationId: Utils.getCIString(templateParams.formValues.organizationId),
                    _id: { $ne: _id }

                }, function(err, findResult) {
                    
                    if (findResult) {
                        
                        templateParams.formValues.password = "";

                        templateParams.errorMessage = self.l10n('The organization ID is taken.');
                        self.render(request,response,'/Organization/Edit',templateParams);

                        if (templateParams.file) fs.unlink(templateParams.file.path, function() {});

                        return;
                    }
                    
                    done(err, result);
                    
                });

            },
            function(result, done){
                                
                // get original data
                model.findOne({ _id: _id },function(err,findResult){
                    
                    if(!findResult){
                        response.redirect('/owner/organization/list'); 

                        if (templateParams.file) fs.unlink(templateParams.file.path, function() {});

                        return;
                    }
                    
                    result.originalData = findResult;

                    done(err,result);
                    
                });
               
            },
            function(result, done) {

                // check duplication
                userModel.findOne({                
                    userid : Utils.getCIString(templateParams.formValues.userid),
                    organizationId: _id,
                    permission : { $ne : Const.userPermission.organizationAdmin }
                }, function(err, findResult) {
                    
                    if (findResult) {
                        
                        templateParams.formValues.password = "";

                        templateParams.errorMessage = self.l10n('The userid is taken.');
                        self.render(request, response, '/Organization/Edit', templateParams);
                        
                        if (templateParams.file) fs.unlink(templateParams.file.path, function() {});
                        
                        return;
                    }
                    
                    done(err, result);
                    
                });

            },
            // get users count
            (result, done) => {

                userModel.count({ organizationId: _id }, (err, findResult) => {

                    if (findResult > templateParams.formValues.maxUserNumber) {
                        
                        templateParams.formValues.password = "";

                        templateParams.errorMessage = self.l10n('Max Users must be less than current user count.');
                        self.render(request, response, '/Organization/Edit', templateParams);
                        
                        if (templateParams.file) fs.unlink(templateParams.file.path, function() {});
                        
                        return;
                    }

                    result.usersCount = findResult;
                    done(err, result);
                    
                });

            },
            // get groups count
            (result, done) => {

                groupModel.count({ organizationId: _id }, (err, findResult) => {

                    if (findResult > templateParams.formValues.maxGroupNumber) {
                        
                        templateParams.formValues.password = "";

                        templateParams.errorMessage = self.l10n('Max groups must be less than current group count.');
                        self.render(request, response, '/Organization/Edit', templateParams);
                        
                        if (templateParams.file) fs.unlink(templateParams.file.path, function() {});
                        
                        return;
                    }

                    result.groupsCount = findResult;
                    done(err, result);
                    
                });

            },
            // get users
            (result, done) => {

                userModel.find({ organizationId: _id }, (err, findResult) => {

                    result.users = findResult;
                    done(err, result);
                    
                });

            },
            // get rooms count
            (result, done) => {

                roomModel.count({ owner: { $in: _.pluck(result.users, "_id") }}, (err, findResult) => {

                    if (findResult > templateParams.formValues.maxRoomNumber) {
                        
                        templateParams.formValues.password = "";

                        templateParams.errorMessage = self.l10n('Max rooms must be less than current room count.');
                        self.render(request, response, '/Organization/Edit', templateParams);
                        
                        if (templateParams.file) fs.unlink(templateParams.file.path, function() {});
                        
                        return;
                    }

                    result.roomsCount = findResult;
                    done(err, result);
                    
                });

            },

            // update organization
            function(result, done) {

                var sortName = _.isEmpty(templateParams.formValues.sortName) ? templateParams.formValues.name.toLowerCase() : templateParams.formValues.sortName;

                // update
                var updateParams = {
                    name: templateParams.formValues.name,
                    sortName: sortName,
                    maxUserNumber: templateParams.formValues.maxUserNumber,
                    maxGroupNumber: templateParams.formValues.maxGroupNumber,
                    maxRoomNumber: templateParams.formValues.maxRoomNumber,
                    diskQuota: templateParams.formValues.diskQuota,
                    status: templateParams.formValues.status,
                    organizationId: templateParams.formValues.organizationId,
                    email: templateParams.formValues.email
                };          

                if (templateParams.file) {

                    easyImg.thumbnail({
                         src: templateParams.file.path,
                         dst: path.dirname(templateParams.file.path) + "/" + Utils.getRandomString(),
                         width: Const.thumbSize,
                         height: Const.thumbSize
                    }).then(
                        function(thumbnail) {

                            updateParams.logo = {

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

                                fs.unlink(Config.uploadPath + "/" + result.originalData.logo.picture.nameOnServer, function() {});
                                fs.unlink(Config.uploadPath + "/" + result.originalData.logo.thumbnail.nameOnServer, function() {});
                                
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

                    if (result.originalData.logo.picture.size) {

                        var originalSize = result.originalData.logo.picture.size + result.originalData.logo.thumbnail.size;
                        var newSize = templateParams.file.size + result.thumbnailSize;

                        size = newSize - originalSize;

                    } else {

                        size = templateParams.file.size + result.thumbnailSize;

                    }

                    UpdateOrganizationDiskUsageLogic.update(_id, size, (err, updateResult) => {
                        done(err, result);
                    });
                    
                } else {

                    done(null, result);

                }

            },
            // update user
            function(result, done) {
                
                var updateParams = { 
                    name: templateParams.formValues.username,
                    userid: templateParams.formValues.userid 
                };

                if(!_.isEmpty(templateParams.formValues.password)) {
                    updateParams.password = Utils.getHash(templateParams.formValues.password);

                    self.logoutUser(_id,templateParams.formValues.userid);

                };

                //
                userModel.update({
                    organizationId: _id, 
                    permission: Const.userPermission.organizationAdmin 
                }, updateParams, function(err, updateResult) {
                        
                    done(err, result);
                     
                });

            },
            function (result, done) {

                model.findOne({ _id: _id }, { logo: true }, function(err, findResult) {

                    if (findResult) {
                        templateParams.formValues.logo = findResult.logo;
                    }

                    done(err, result);

                });

            }
        ],
        function(err, result) {
            
            if (err) {
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;

                if (templateParams.file) fs.unlink(templateParams.file.path, function() {});
                if (result.thumbnailPath) fs.unlink(result.thumbnailPath, function() {}); 

            } else {
                templateParams.successMessage = self.l10n('The organization is successfully updated.');
            }

            templateParams.formValues.password = "";
            
            self.render(request,response,'/Organization/Edit', templateParams);
            
        });
        
    });
    
    router.get('/deleteLogo', checkUserOwner, function(request, response) {

        var _id = request.query._id;
        var pictureName = request.query.pictureName;
        var pictureSize = Number(request.query.pictureSize);
        var thumbnailName = request.query.thumbnailName;
        var thumbnailSize = Number(request.query.thumbnailSize);
        var uploadFilePath = request.query.uploadFilePath;
        
        if(_.isEmpty(_id)) {
            
            response.redirect('/owner/organization/list');  
            return;
            
        }
        var model = OrganizationModel.get();
        
        async.waterfall([
            
            function(done) {
                
                model.update({ _id: _id }, { $unset: { logo: "" } }, function(errUpdate, updateResult) {

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

                UpdateOrganizationDiskUsageLogic.update(_id, size, (err, updateResult) => {
                    done(err, result);
                });

            }
        ],
        function(err, result) {
            if (err) console.log(err);

            response.redirect("/owner/organization/edit/" + _id);
        });
        
    });

    return router;
}

OrganizationsController.prototype.validation = function(values, isEdit) {
    
    var name = values.formValues.name;
    var organizationId = values.formValues.organizationId;
    var username = values.formValues.username;
    var userid = values.formValues.userid;
    var password = values.formValues.password;
    var maxUserNumber = values.formValues.maxUserNumber;
    var maxGroupNumber = values.formValues.maxGroupNumber;
    var maxRoomNumber = values.formValues.maxRoomNumber;
    var diskQuota = values.formValues.diskQuota;
    var email = values.formValues.email;

    var file = values.file;

    var errorMessage = "";
    
    if (!isEdit) {

        if (_.isEmpty(name)) {
            
            errorMessage = this.l10n('Please input name.');
                
        } else if (_.isEmpty(organizationId)){
            
            errorMessage = this.l10n('Please input organization id.');
        
        } else if (!Const.REUsername.test(organizationId)){
            
            errorMessage = this.l10n('Organization id must contain only alphabet and number, and more than 6 characters.');
            
        } else if (_.isEmpty(username)){
            
            errorMessage = this.l10n('Please input user name.');

        } else if (_.isEmpty(userid)){
            
            errorMessage = this.l10n('Please input user id.');

        } else if (!Const.REUsername.test(userid)){
            
            errorMessage = this.l10n('User id must contain only alphabet and number, and more than 6 characters.');
            
        } else if (_.isEmpty(password)){
            
            errorMessage = this.l10n('Please input password.');
            
        } else if (!Const.REPassword.test(password)){
            
            errorMessage = this.l10n('Password must contain only alphabet and number, and more than 6 characters.');
            
        } else if (_.isEmpty(maxUserNumber)){
            
            errorMessage = this.l10n('Please input max user number.');
            
        } else if (!Const.RENumbers.test(maxUserNumber)){
            
            errorMessage = this.l10n('Max user number must contain only numeric values.');

        } else if (_.isEmpty(maxGroupNumber)){
            
            errorMessage = this.l10n('Please input max group number.');
            
        } else if (!Const.RENumbers.test(maxGroupNumber)){
            
            errorMessage = this.l10n('Max group number must contain only numeric values.');

        } else if (_.isEmpty(maxRoomNumber)){
            
            errorMessage = this.l10n('Please input max room number.');
            
        } else if (!Const.RENumbers.test(maxRoomNumber)){
            
            errorMessage = this.l10n('Max room number must contain only numeric values.');

        } else if (_.isEmpty(diskQuota)){
            
            errorMessage = this.l10n('Please input disk quota number.');
            
        } else if (!Const.RENumbers.test(diskQuota)){
            
            errorMessage = this.l10n('Disk quota must contain only numeric values.');

        } else if (!_.isEmpty(email) && !validator.isEmail(email)){
            
            errorMessage = this.l10n('Please input valida email address.');

        }
            
    } else {
        
        if (_.isEmpty(name)) {
            
            errorMessage = this.l10n('Please input name.');
        
        } else if (_.isEmpty(organizationId)){
            
            errorMessage = this.l10n('Please input organization id.');
        
        } else if (!Const.REUsername.test(organizationId)){
            
            errorMessage = this.l10n('Organization id must contain only alphabet and number, and more than 6 characters.');
            
        } else if (_.isEmpty(userid)){
            
            errorMessage = this.l10n('Please input user id.');

        } else if (_.isEmpty(username)){
            
            errorMessage = this.l10n('Please input user name.');

        } else if (!Const.REUsername.test(userid)){
            
            errorMessage = this.l10n('User id must contain only alphabet and number, and more than 6 characters.');
            
        } else if (!_.isEmpty(password) && !Const.REPassword.test(password)){
            
            errorMessage = this.l10n('Password must contain only alphabet and number, and more than 6 characters.');
            
        } else if (_.isEmpty(maxUserNumber)){
            
            errorMessage = this.l10n('Please input max user number.');
            
        } else if (!Const.RENumbers.test(maxUserNumber)){
            
            errorMessage = this.l10n('Max user number must contain only numeric values.');

        } else if (_.isEmpty(maxGroupNumber)){
            
            errorMessage = this.l10n('Please input max group number.');
            
        } else if (!Const.RENumbers.test(maxGroupNumber)){
            
            errorMessage = this.l10n('Max group number must contain only numeric values.');

        } else if (_.isEmpty(maxRoomNumber)){
            
            errorMessage = this.l10n('Please input max room number.');
            
        } else if (!Const.RENumbers.test(maxRoomNumber)){
            
            errorMessage = this.l10n('Max room number must contain only numeric values.');

        } else if (_.isEmpty(diskQuota)){
            
            errorMessage = this.l10n('Please input disk quota number.');
            
        } else if (!Const.RENumbers.test(diskQuota)){
            
            errorMessage = this.l10n('Disk quota must contain only numeric values.');

        } else if (!_.isEmpty(email) && !validator.isEmail(email)){
            
            errorMessage = this.l10n('Please input valida email address.');

        }
        
    }
    
    if (file && _.isEmpty(errorMessage)) {

        if (file.type.search("image/") == -1) errorMessage = this.l10n('File must be image type.');  

    }

    return errorMessage;
    
}

OrganizationsController.prototype.logoutUser = function(organizationId,userId){

    var userModel = UserModel.get();

    async.waterfall([(done) => {

        var result = {};

        // add user id to force logout list
        DatabaseManager.redisGet(Const.adminForcelogoutList,function(err,value){
                
            if(!value){
                value = [];
            }
            
            value.push({
                organizationId: organizationId,
                userId : userId
            })
            
            DatabaseManager.redisSave(Const.adminForcelogoutList,value);

            done(err,result);
            
        });

    },
    (result,done) =>{
        
        // remove all tokens
        userModel.update({
            organizationId: organizationId, 
            permission: Const.userPermission.organizationAdmin 
        },{
            token: []
        },function(err,updateResult){

            done(err,updateResult);

        });
    }
    ],
    (err,result) =>{

    });

}

module["exports"] = new OrganizationsController();