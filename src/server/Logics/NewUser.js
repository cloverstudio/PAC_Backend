/** Create new user */

var _ = require('lodash');
var async = require('async');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var Utils = require("../lib/utils");

var UserModel = require('../Models/User');
var GroupModel = require('../Models/Group');

var easyImg = require('easyimage');
var fs = require('fs');
var path = require('path');

var UpdateOrganizationDiskUsageLogic = require("./UpdateOrganizationDiskUsage");

var NewUser = {
    
    create: function(name, sortName, description, userid, password, status, organizationId, permission, groups, file, callBack) {

        var userModel = UserModel.get();
        var groupModel = GroupModel.get();

        if (_.isEmpty(name)) name = userid;

        if (_.isEmpty(sortName)) sortName = name.toLowerCase();

        if (_.isEmpty(description)) description = "";

        if (status === "") status = 1;

        if (permission === "" || permission == undefined || !permission) permission = Const.userPermission.webClient;

        if (_.isEmpty(groups)) groups = [];

        async.waterfall([

            function(done) {
                    
                var result = {};
                
                var hash = Utils.getHash(password);

                var data = {
                    
                    name: name,
                    sortName: sortName,
                    description: description,
                    userid: userid,
                    password: hash,
                    created: Utils.now(),
                    status: status,
                    organizationId: organizationId,
                    permission: permission,
                    groups: groups

                };                

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
                            
                            var user = new userModel(data);
                            // save to DB          
                            user.save(function(err, saveResult) {

                                if (err) {
                                    done(err, result);
                                    return;
                                }

                                var _idUser = saveResult._id.toString();
                                
                                groupModel.update(
                                    { _id: { $in: groups } }, 
                                    { $push: { users: _idUser } }, 
                                    { multi: true }, 
                                function(err, updateResult) {

                                    if (err) {

                                        model.remove({ _id: _idUser }, function(err, deleteResult) { 
                                            done(err, result);
                                        });

                                    } else {

                                        result.user = saveResult;
                                        done(null, result);

                                    }

                                });

                            });

                        },
                        function (err) {
                            done(err, result);
                        }
                    );

                } else {

                    var user = new userModel(data);
                    // save to DB          
                    user.save(function(err, saveResult) {

                        if (err) {
                            done(err, result);
                            return;
                        }

                        var _idUser = saveResult._id.toString();
                        
                        groupModel.update(
                            { _id: { $in: groups } }, 
                            { $push: { users: _idUser } }, 
                            { multi: true }, 
                        function(err, updateResult) {

                            if (err) {

                                model.remove({ _id: _idUser }, function(err, deleteResult) { 
                                    done(err, result);
                                });

                            } else {

                                result.user = saveResult;
                                done(null, result);

                            }

                        });

                    });

                }

            },
            function(result, done) {

                // update organization disk usage
                if (file) {

                    var size = file.size + result.thumbnailSize;

                    UpdateOrganizationDiskUsageLogic.update(organizationId, size, (err, updateResult) => {
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


module["exports"] = NewUser;