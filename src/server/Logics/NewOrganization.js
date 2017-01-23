/** Create new organization and admin user */

var _ = require('lodash');
var async = require('async');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var Utils = require("../lib/utils");

var OrganizationModel = require('../Models/Organization');
var UserModel = require('../Models/User');
var GroupModel = require('../Models/Group');

var easyImg = require('easyimage');
var fs = require('fs');
var path = require('path');

var UpdateOrganizationDiskUsageLogic = require("./UpdateOrganizationDiskUsage");

var NewOrganization = {
    
    create: function(organizationId, userId, password, username, name, sortName, email, maxUserNumber, maxGroupNumber, maxRoomNumber, diskQuota, status, file, callBack) {

        var organizationModel = OrganizationModel.get();
        var userModel = UserModel.get();
        var groupModel = GroupModel.get();

        if (_.isEmpty(name)) name = organizationId;
        
        if (_.isEmpty(username)) username = userId;
        
        if (_.isEmpty(sortName)) sortName = name.toLowerCase();

        if (_.isEmpty(email)) email = "";

        if (_.isEmpty(maxUserNumber)) maxUserNumber = 100;

        if (_.isEmpty(maxGroupNumber)) maxGroupNumber = 100;

        if (_.isEmpty(maxRoomNumber)) maxRoomNumber = 1000;

        if (_.isEmpty(diskQuota)) diskQuota = 10;

        if (_.isEmpty(status)) status = 1;

        async.waterfall([

            // save organization
            function(done) {
                    
                var result = {};
                
                var data = {            
                    
                    name: name,
                    sortName: sortName,
                    created: Utils.now(),
                    maxUserNumber: maxUserNumber,
                    maxGroupNumber: maxGroupNumber,
                    maxRoomNumber: maxRoomNumber,
                    diskQuota: diskQuota,
                    status: status,
                    organizationId: organizationId,
                    email: email
                    
                };

                if (file) {

                    easyImg.thumbnail({
                         src: file.path,
                         dst: path.dirname(file.path) + "/" + Utils.getRandomString(),
                         width: Const.thumbSize,
                         height: Const.thumbSize
                    }).then(
                        function(thumbnail) {

                            data.logo = {

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
                            
                            var organization = new organizationModel(data);
                            // save to DB          
                            organization.save(function(err, saveResult){
                                
                                result.organization = saveResult;
                                done(err, result);
                            
                            });

                        },
                        function (err) {
                            done(err, result);
                        }
                    );

                } else {

                    var organization = new organizationModel(data);
                    // save to DB          
                    organization.save(function(err, saveResult){

                        result.organization = saveResult;                        
                        done(err, result);
                    
                    });

                }

            },

            // save user
            function(result, done) {
                
                var hash = Utils.getHash(password);

                var user = new userModel({
                    
                    name: username,
                    sortName: userId.toLowerCase(),
                    description: "",
                    userid: userId,
                    password: hash,
                    created: Utils.now(),
                    organizationId: result.organization._id,
                    status: result.organization.status,
                    permission: Const.userPermission.organizationAdmin

                });

                // save to DB
                user.save(function(err, saveResult) {

                    if (err) {

                        organizationModel.remove({ _id: result.organization._id }, function(errDelete, deleteResult) {
                            
                            done(err, result);
                             
                        });
                        
                    } else {

                        result.user = saveResult;
                        done(null, result);

                    }
                    
                });

            },

            // save department
            function(result, done) {
                
                var department = new groupModel({
                    
                    name: "Top",
                    sortName: "top",
                    description: "",
                    created: Utils.now(),
                    organizationId: result.organization._id,
                    users: [
                        result.user._id
                    ],
                    parentId: "",
                    type: Const.groupType.department,
                    default: true
                    
                });

                // save to DB
                department.save(function(err, saveResult) {

                    if (err) {

                        organizationModel.remove({ _id: result.organization._id }, function(errDelete, deleteResult) {
                            
                            userModel.remove({ _id: result.user._id }, function(errDelete, deleteResult) {
                            
                                done(err, result);
                                 
                            });
                             
                        });
                        
                    } else {

                        result.department = saveResult;
                        done(null, result);

                    }
                    
                });

            },

            // update department in user model
            function(result, done) {

                userModel.update({ _id: result.user._id }, { $set: { groups: result.department._id } }, function(err, updateResult) {

                    if (err) {

                        organizationModel.remove({ _id: result.organization._id }, function(errDelete, deleteResult) {
                            
                            userModel.remove({ _id: result.user._id }, function(errDelete, deleteResult) {
                                
                                groupModel.remove({ _id: result.department._id }, function(errDelete, deleteResult) {
                                
                                    done(err, result);
                                     
                                });
                                 
                            });
                             
                        });
                        
                    } else {

                        done(null, result);

                    }
                     
                });

            },
            function(result, done) {

                // update organization disk usage
                if (file) {

                    var size = file.size + result.thumbnailSize;

                    UpdateOrganizationDiskUsageLogic.update(result.organization._id, size, (err, updateResult) => {
                        done(err, result);
                    });
                    
                } else {

                    done(null, result);

                }

            }        
        ],
        function(err, result) {    
            
            if (err) {
                if (file) fs.unlink(file.path, function() {});
                if (result.thumbnailPath) fs.unlink(result.thumbnailPath, function() {});
            };

            callBack(err, result);
            
        });
        
    }
};


module["exports"] = NewOrganization;