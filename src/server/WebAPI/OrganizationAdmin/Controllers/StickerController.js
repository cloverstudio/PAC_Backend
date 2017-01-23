/** Called for URL /admin/sticker */

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

var StickerModel = require('../../../Models/Sticker');
var checkUserAdmin = require('../../../lib/auth.js').checkUserAdmin;

var formidable = require('formidable');
var fs = require('fs');
var easyImg = require('easyimage');
var JSZip = require("jszip");
var mime = require('mime');

var UpdateOrganizationDiskUsageLogic = require("../../../Logics/UpdateOrganizationDiskUsage");

var StickerController = function() {
}

// extends from basecontroller
_.extend(StickerController.prototype, BackendBaseController.prototype);

StickerController.prototype.init = function(app) {
    
    var self = this;
    var menuItemName = "sticker";

    router.get('/list', checkUserAdmin, function(request, response) {
            
        var page = request.query.page;
        if(!page)
            page = 1;
            
        var templateParams = {
            page : menuItemName + "-list",
            openMenu : menuItemName
        };
        
        var model = StickerModel.get();
        var keyword = request.session.stickerAdminKeyword;
        var organizationId = request.session.user.organizationId;
        
        async.waterfall([
            
            function(done){
                                
                var criteria = { 
                    $or: [
                        { organizationId: organizationId },
                        { organizationId: { $exists: false } }
                    ]
                };
                
                if(!_.isEmpty(keyword)){
                    
                    criteria.name = new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i");
                    
                }
                
                model.find(criteria).
                        limit(Const.pagingRows).
                        skip( (page - 1 ) * Const.pagingRows).
                        sort({ organizationId: "asc", created: "asc" }).
                exec(function(err,findResult){
                   
                    done(err, { list: findResult });
                    
                });

            },
            function(result,done){

                var criteria = { 
                    $or: [
                        { organizationId: organizationId },
                        { organizationId: { $exists: false } }
                    ]
                };
                
                if(!_.isEmpty(keyword)){
                    
                    criteria.name = new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i")
                    
                }
                
                // get count
                model.count(criteria,function(err,countResult){
                    
                    result.count = countResult;
                    done(err, result);
                    
                });
                
            }
        ],
        function(err,result){

            if(err)
                templateParams.errorMessage = self.l10n('Critical Error.');
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
                baseURL : "/admin/sticker/list?page="
                
            }
            
            if(request.query.delete){
                templateParams.successMessage = self.l10n('The sticker is successfully deleted.');
            }
            
            templateParams.keyword = keyword;
            
            self.render(request, response, '/Sticker/List', templateParams);
            
        });

    });

    router.all('/search', checkUserAdmin, function(request,response){

        var templateParams = {
            page : menuItemName + "-list",
            openMenu : menuItemName
        };
        
        var keyword = request.body.keyword;        
        
        request.session.stickerAdminKeyword = keyword;
            
        response.redirect('/admin/sticker/list');  
        
    });

    router.get('/add', checkUserAdmin, function(request, response) {

        var templateParams = {
            page : menuItemName + "-list",
            openMenu : menuItemName
        };

        self.render(request, response, '/Sticker/Add', templateParams);

    });
    
    router.post('/add', checkUserAdmin, function(request,response) {

        var templateParams = {
            page : menuItemName + "-list",
            openMenu : menuItemName
        };

        var model = StickerModel.get();
        var uploadPathError = self.checkUploadPath();

        async.waterfall([
            
            function(done) {
               
                var form = new formidable.IncomingForm();

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

                self.validation(request, response, model, templateParams, false, function(err) {
                    done(err, result);
                });

            },
            function(result, done) {

                fs.readFile(templateParams.file.path, function(err, data) {
                        
                    if (err) {
                        done(err, result);
                        return;
                    }

                    result.extractedFiles = [];

                    var zip = new JSZip(data);

                    _.forEach(zip.files, function(file, filename) { 

                        // ignore folders and files in folders
                        if (!file.dir && path.dirname(filename) == ".") {

                            var content = file.asNodeBuffer();
                            var dest = path.join(Config.uploadPath, Utils.getRandomString());
                              
                            fs.writeFileSync(dest, content);
                
                            result.extractedFiles.push({

                                picture: {
                                    originalName: filename,
                                    size: fs.statSync(dest).size,
                                    mimeType: mime.lookup(filename),
                                    nameOnServer: path.basename(dest)
                                }

                            });
                            
                        }

                    });
                   
                    done(err, result);

                });

            },
            function(result, done) {

                var sortName = _.isEmpty(templateParams.formValues.sortName) ? templateParams.formValues.name.toLowerCase() : templateParams.formValues.sortName;
                var sticker = null;

                var data = {

                    name: templateParams.formValues.name,
                    sortName: sortName,
                    description: templateParams.formValues.description,
                    created: Utils.now(),
                    pictures: [],
                    type: Const.stickerType.admin,
                    organizationId: request.session.user.organizationId

                };
                
                var fileSize = 0;

                _.forEach(result.extractedFiles, function(file) { 

                    easyImg.thumbnail({
                         src: path.join(Config.uploadPath, file.picture.nameOnServer),
                         dst: path.join(Config.uploadPath, Utils.getRandomString()),
                         width: Const.thumbSize,
                         height: Const.thumbSize
                    }).then(
                        function(thumbnail) {

                            data.pictures.push({                            

                                picture: {
                                    originalName: file.picture.originalName,
                                    size: file.picture.size,
                                    mimeType: file.picture.mimeType,
                                    nameOnServer: file.picture.nameOnServer
                                },
                                thumbnail: {
                                    originalName: file.picture.originalName,
                                    size: thumbnail.size,
                                    mimeType: thumbnail.type,
                                    nameOnServer: thumbnail.name
                                },
                                main: (data.pictures.length == 0) ? true : false

                            });
                            
                            file.thumbnail = { nameOnServer: thumbnail.name };

                            fileSize += file.picture.size + thumbnail.size;

                            if (result.extractedFiles.length == data.pictures.length) {

                                sticker = new model(data);
                                // save to DB          
                                sticker.save(function(err, saveResult) {

                                    result.fileSize = fileSize;
                                    done(err, result);
                                
                                });

                            };

                        },
                        function (err) {
                            done(err, result);
                        }
                    );                        

                });

            },
            function(result, done) {

                // update organization disk usage
                UpdateOrganizationDiskUsageLogic.update(request.session.user.organizationId, result.fileSize, (err, updateResult) => {
                    done(err, result);
                });            

            }
        ],
        function(err, result) {

            if (err) {
                if (err.clientError)
                    templateParams.errorMessage = self.l10n(err.clientError);
                else
                    templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;

                self.deleteUploadedFiles(result.extractedFiles);

            } else {
                templateParams.successMessage = self.l10n('New sticker is created.');
            }
            
            // delete .zip file in tmp folder
            if (templateParams.file) fs.unlink(templateParams.file.path, function() {});

            self.render(request, response, '/Sticker/Add', templateParams);
                    
        });

    });
    
    router.get('/edit/:_id', checkUserAdmin, function(request,response) {

        var _id = request.params._id;
        
        var templateParams = {
            page : menuItemName + "-list",
            openMenu : menuItemName
        };
        
        if(_.isEmpty(_id)){
            
            response.redirect('/admin/sticker/list');  
            return;
            
        }
        
        var model = StickerModel.get();
        
        async.waterfall([
            
            function(done) {
                
                var result = {};
                
                model.findOne({ _id: _id }, function(err, findResult) {
                    
                    if(!findResult){
                        response.redirect('/admin/sticker/list');  
                        return;
                    }
                    
                    result.obj = findResult;
                    done(err,result);
                    
                });

            }
        ],
        function(err,result){

            if(err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
 
            templateParams.formValues = result.obj;

            self.render(request, response, '/Sticker/Edit', templateParams);
            
        });
        
    });

    router.post('/edit/:_id', checkUserAdmin, function(request, response) {

        var _id = request.params._id;

        var templateParams = {
            page : menuItemName + "-list",
            openMenu : menuItemName
        };
        
        if(_.isEmpty(_id)){
            
            response.redirect('/admin/sticker/list');  
            return;
            
        }

        var model = StickerModel.get();
        var uploadPathError = self.checkUploadPath();

        async.waterfall([

            function(done) {
                
                var form = new formidable.IncomingForm();

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

                model.findOne({ _id: _id }, function(err, findResult) {

                    if (!findResult) {

                        response.redirect('/admin/sticker/list'); 

                        // delete .zip file in tmp folder
                        if (templateParams.file) fs.unlink(templateParams.file.path, function() {});
                        
                        return;
                    }            

                    templateParams.formValues.pictures = findResult.pictures;
                    result.originalData = findResult;   

                    var originalFileSize = 0;

                    _.forEach(templateParams.formValues.pictures, function(picture) { 

                        originalFileSize += picture.picture.size + picture.thumbnail.size;

                        picture.main = (picture.thumbnail.nameOnServer == templateParams.formValues.main);

                    });

                    result.originalFileSize = originalFileSize;
                    done(err, result);

                });

            },
            function(result, done) {    

                self.validation(request, response, model, templateParams, true, function(err) {
                    done(err, result);
                });

            },
            function(result, done) {

                if (templateParams.file) {

                    fs.readFile(templateParams.file.path, function(err, data) {
                            
                        if (err) {
                            done(err, result);
                            return;
                        }

                        result.extractedFiles = [];

                        var zip = new JSZip(data);

                        _.forEach(zip.files, function(file, filename) { 

                            // ignore folders and files in folders
                            if (!file.dir && path.dirname(filename) == ".") {

                                var content = file.asNodeBuffer();
                                var dest = path.join(Config.uploadPath, Utils.getRandomString());
                                  
                                fs.writeFileSync(dest, content);
                    
                                result.extractedFiles.push({

                                    picture: {
                                        originalName: filename,
                                        size: fs.statSync(dest).size,
                                        mimeType: mime.lookup(filename),
                                        nameOnServer: path.basename(dest)                                    
                                    }

                                });
                                
                            }

                        });
                       
                        done(err, result);

                    });

                } else {

                    done(null, result);   

                }

            },
            function (result, done) {

                var sortName = _.isEmpty(templateParams.formValues.sortName) ? templateParams.formValues.name.toLowerCase() : templateParams.formValues.sortName;
                
                var updateParams = {

                    name: templateParams.formValues.name,
                    sortName: sortName,
                    description: templateParams.formValues.description,
                    pictures: []

                };

                if (templateParams.file) {

                    var newFileSize = 0;

                    _.forEach(result.extractedFiles, function(file) { 

                        easyImg.thumbnail({
                             src: path.join(Config.uploadPath, file.picture.nameOnServer),
                             dst: path.join(Config.uploadPath, Utils.getRandomString()),
                             width: Const.thumbSize,
                             height: Const.thumbSize
                        }).then(
                            function(thumbnail) {

                                updateParams.pictures.push({                            

                                    picture: {
                                        originalName: file.picture.originalName,
                                        size: file.picture.size,
                                        mimeType: file.picture.mimeType,
                                        nameOnServer: file.picture.nameOnServer
                                    },
                                    thumbnail: {
                                        originalName: file.picture.originalName,
                                        size: thumbnail.size,
                                        mimeType: thumbnail.type,
                                        nameOnServer: thumbnail.name
                                    },
                                    main: (updateParams.pictures.length == 0) ? true : false

                                });
                                
                                file.thumbnail = { nameOnServer: thumbnail.name };

                                newFileSize += file.picture.size + thumbnail.size;

                                if (result.extractedFiles.length == updateParams.pictures.length) {

                                    model.update({ _id: _id }, updateParams, function(err, updateResult) {
                    
                                        if (!err) self.deleteUploadedFiles(result.originalData.pictures);

                                        result.newFileSize = newFileSize;
                                        done(err, result);                                    
                                        
                                    });

                                };

                            },
                            function (err) {
                                done(err, result);
                            }
                        );                        

                    });            

                } else {

                    updateParams.pictures = templateParams.formValues.pictures;
                    model.update({ _id: _id }, updateParams, function(err, updateResult) {
                    
                        done(err, result);
                        
                    });

                }

            },
            function(result, done) {

                // update organization disk usage
                if (templateParams.file) {

                    var size = result.newFileSize - result.originalFileSize;

                    UpdateOrganizationDiskUsageLogic.update(request.session.user.organizationId, size, (err, updateResult) => {
                        done(err, result);
                    });

                } else {

                    done(null, result);

                }

            },
            function (result, done) {

                if (templateParams.file) {

                    model.findOne({ _id: _id }, { pictures: true }, function(err, findResult) {

                        if (findResult) {
                            templateParams.formValues.pictures = findResult.pictures;
                        }

                        done(err, result);

                    });

                } else {

                    done(null, result);

                }

            }
        ],
        function(err, result) {
            
            if(err) {
                if (err.clientError)
                    templateParams.errorMessage = self.l10n(err.clientError);
                else
                    templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;

                self.deleteUploadedFiles(result.extractedFiles);

            } else {
                templateParams.successMessage = self.l10n('The sticker is successfully updated.');
            }

            // delete .zip file in tmp folder
            if (templateParams.file) fs.unlink(templateParams.file.path, function() {});

            self.render(request, response, '/Sticker/Edit', templateParams);
            
        });

    });
    
    router.get('/delete/:_id', checkUserAdmin, function(request,response){

        var _id = request.params._id;
        
        var templateParams = {
            page : menuItemName + "-list",
            openMenu : menuItemName
        };
        
        if(_.isEmpty(_id)){
            
            response.redirect('/admin/sticker/list');  
            return;
            
        }
        
        var model = StickerModel.get();
        
        async.waterfall([
            
            function(done) {
                
                var result = {};
                
                model.findOne({ _id: _id },function(err,findResult){
                    
                    if(!findResult){
                        response.redirect('/admin/sticker/list');  
                        return;
                    }
                    
                    result.obj = findResult;
                    done(err,result)
                    
                });

            }
        ],
        function(err,result) {

            if(err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
 
            templateParams.formValues = result.obj;
            
            self.render(request, response, '/Sticker/Delete', templateParams);
            
        });
        
    });


    router.post('/delete/:_id', checkUserAdmin, function(request, response) {

        var _id = request.params._id;
        
        var templateParams = {
            page : menuItemName + "-list",
            openMenu : menuItemName
        };
        
        var model = StickerModel.get();
        var uploadPathError = self.checkUploadPath();

        async.waterfall([
            
            function(done) {
                
                model.findOne({ _id: _id }, function(err, findResult) {
                    
                    if(!findResult){
                        response.redirect('/admin/sticker/list');  
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

                    if (!err) self.deleteUploadedFiles(result.obj.pictures);

                    done(err, result);

                });
                
            },
            function(result, done) {

                var size = 0;

                _.forEach(result.obj.pictures, function(file) {

                   size += file.picture.size + file.thumbnail.size;
                    
                });

                // update organization disk usage
                UpdateOrganizationDiskUsageLogic.update(request.session.user.organizationId, -size, (err, updateResult) => {
                    done(err, result);
                });

            }
        ],
        function(err, result) {

            if (err) {

                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;

                templateParams.formValues = result.obj;

                self.render(request, response, '/Sticker/Delete', templateParams);

                return;
            }
          
            response.redirect('/admin/sticker/list?delete=1');

        });

    });
    
    router.get('/view/:_id', checkUserAdmin, function(request,response){

        var _id = request.params._id;
        
        var templateParams = {
            page : menuItemName + "-list",
            openMenu : menuItemName
        };
        
        if(_.isEmpty(_id)){
            
            response.redirect('/admin/sticker/list');  
            return;
            
        }
        
        var model = StickerModel.get();
        
        async.waterfall([
            
            function(done) {
                
                var result = {};
                
                model.findOne({ _id: _id },function(err,findResult){
                    
                    if(!findResult){
                        response.redirect('/admin/sticker/list');  
                        return;
                    }
                    
                    result.obj = findResult;
                    done(err,result)
                    
                });

            }
        ],
        function(err,result) {

            if(err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
 
            templateParams.formValues = result.obj;
            
            self.render(request, response, '/Sticker/View', templateParams);
            
        });
        
    });

    return router;
}

StickerController.prototype.validation = function(request, response, model, templateParams, isEdit, callback) {

    var errorMessage = "";

    var formValues = templateParams.formValues;
    var file = templateParams.file;

    async.waterfall([

        function(done) {

           if (_.isEmpty(formValues.name)) {

                errorMessage = 'Please input name.';

            } else if (file) {

                if (path.extname(file.name).toLowerCase() != ".zip") errorMessage = 'File must be *.zip only.';  

            } else if (!isEdit) {

                errorMessage = 'Please choose file.';

            }

            done(errorMessage);

        },
        function(done) {

            if (!isEdit) {

                // check duplication
                model.findOne({ 
                    name: Utils.getCIString(formValues.name),
                    $or: [
                        { organizationId: request.session.user.organizationId },
                        { organizationId: { $exists: false } }
                    ]
                }, function(err, findResult) {

                    if (findResult) errorMessage = 'The sticker name is taken.';
                    
                    done(errorMessage);

                });

            } else {

                // check duplications
                model.findOne({ 
                    name : Utils.getCIString(formValues.name), 
                    _id : { $ne : formValues._id },
                    $or: [
                        { organizationId: request.session.user.organizationId },
                        { organizationId: { $exists: false } }
                    ]
                }, function(err, findResult) {
                    
                    if (findResult) errorMessage = 'The sticker name is taken.';
                    
                    done(errorMessage);
                    
                });
            
            }

        },
        function(done) {

            if (file) {

                fs.readFile(file.path, function(err, data) {
                        
                    if (err) {
                        done(err);
                        return;
                    }

                    var zip = new JSZip(data);
                    var fileExists = false;  // check if file exists in .zip iteration

                    _.forEach(zip.files, function(file, filename) { 

                        // ignore folders and files in folders
                        if (!file.dir && path.dirname(filename) == ".") {

                            fileExists = true;

                            if (mime.lookup(filename).search("image/") == -1) {

                                errorMessage = 'All files in .zip file must be image types.';                    
                                return;

                            }   

                        }
                        
                    });

                    if (!fileExists) errorMessage = 'There is no image files in .zip file.';                    

                    done(errorMessage);

                });

            } else {

                done(errorMessage);

            };

        }
    ],
    function(err) {

        if (err) 
            callback({ clientError: err });
        else
            callback(null);

    });

}


StickerController.prototype.deleteUploadedFiles = function(files) {

    // delete uploaded files and thumbnails
    _.forEach(files, function(file) {

        if (file.picture) fs.unlink(path.join(Config.uploadPath, file.picture.nameOnServer), function() {});
        if (file.thumbnail) fs.unlink(path.join(Config.uploadPath, file.thumbnail.nameOnServer), function() {});
        
    });

}

module["exports"] = new StickerController();