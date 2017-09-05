/** Create group */
const async = require('async');
const _ = require('lodash');
const Const = require("../../lib/consts");
const Utils = require("../../lib/utils");
const Path = require('path');
const easyImg = require('easyimage');
const GroupModel = require('../../Models/Group');
const UserModel = require('../../Models/User');
const HistoryModel = require('../../Models/History');
const OrganizationModel = require('../../Models/Organization');
const UpdateOrganizationDiskUsageLogic = require('./UpdateOrganizationDiskUsage')
const PermissionLogic = require('./Permission');

const Group = {
    search: (user, keyword, offset, limit, sort, fields, onSuccess, onError) => {
        const organizationId = user.organizationId;
        const groupModel = GroupModel.get();
        async.waterfall([
            (done) => {
                // get departments
                PermissionLogic.getDepartments(user._id.toString(), (departments) => {
                    done(null, { departmentIds: departments });
                });
            },
            // Get groups
            (result, done) => {
                const conditions = {
                    $and: [
                        {organizationId: organizationId},
                        {$or : [
                            { users: user._id.toString() },
                            { _id: { $in: result.departmentIds } }
                        ]}
                    ]
                }
                if(!_.isEmpty(keyword)){
                    conditions['$and'].push(
                        { "$or" : 
                            [
                                { name: new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i") },
                                { description: new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i") }
                            ]
                        }
                    );
                }

                const query = groupModel.find(conditions, fields)
                .skip(offset)
                .sort(sort)
                .limit(limit);

                query.exec((err,data) => {
                    data = data.map((item) => {
                        return item.toObject();
                    });
                    _.each(data, (group, index) => {
                        data[index]["id"] = group["_id"];
                        delete data[index]["_id"];
                    })
                    result.list = data;
                    done(err,result);
                });
            },
            // Get user's data
            (result,done) => {
                const userLists = _.pluck(result.list,'users');
                if (_.contains(userLists, undefined)) done(null, result);
                
                let userIds = [];
                _.forEach(userLists, (userList) => {
                    if(!_.isArray(userList)) return;
                    userIds = userIds.concat(userList);
                });
                userIds = _.uniq(userIds);

                const userModel = UserModel.get();
                userModel.find({_id: {$in:userIds}}, {name:1}, (err, foundUsers) => {
                    foundUsers = foundUsers.map((item) => {
                        return item.toObject();
                    });
                    // Replace users list to list including username
                    _.forEach(result.list, (group, index) => {
                        const userModels = _.filter(foundUsers, (user) => {
                            return group.users.indexOf(user._id);
                        });
                        result.list[index].users =  userModels;                        
                    });
                    done(err,result);
                });
            }
        ],
        (err,result) => {
            if(err){
                if(onError) onError(err);
                return;
            }
            if(onSuccess) onSuccess(result);
        });  
    },
    create: (baseUser, name, sortName, description, users, avatar, onSuccess, onError) => {
        const groupModel = GroupModel.get();
        const organizationId = baseUser.organizationId;
        async.waterfall([
            // Get latest organization data
            (done) => {
                const organizationModel = OrganizationModel.get();                
                organizationModel.findOne({_id: organizationId}, (err, organization) => {
                    done(err, { organization: organization });
                });
            },
            // Check number of groups in organization   
            (result, done) => {
                groupModel.count({ organizationId: organizationId}, (err, numberOfGroup) => {
                    if (numberOfGroup >= result.organization.maxGroupNumber) { 
                        err = 'You can\'t add more groups to this organization. Maximum number of groups/departments in this organization is ' + 
                        result.organization.maxGroupNumber + '.';
                    }
                    result = {}; // because won't use organizatioin data any more
                    done(err, result);
                });
            },
            // save a new group data
            (result, done) => {
                
                const sort = sortName ? sortName : name.toLowerCase();
                result.saveData = {
                    name: name,
                    sortName: sort,
                    description: description,
                    created: Utils.now(),
                    organizationId: organizationId,
                    users: users,
                    type: Const.groupType.group
                }

                if (avatar) {
                    easyImg.thumbnail({
                        src: avatar.path,
                        dst: Path.dirname(avatar.path) + "/" + Utils.getRandomString(),
                        width: Const.thumbSize,
                        height: Const.thumbSize
                    }).then(
                        (thumbnail) => {
                            result.saveData.avatar = {
                                picture: {
                                    originalName: avatar.name,
                                    size: avatar.size,
                                    mimeType: avatar.type,
                                    nameOnServer: Path.basename(avatar.path)
                                },
                                thumbnail: {
                                    originalName: avatar.name,
                                    size: thumbnail.size,
                                    mimeType: thumbnail.type,
                                    nameOnServer: thumbnail.name
                                }
                            };
                            done(null, result);
                        }, (err) => {
                            done(err, result);
                        }
                    );
                } else {
                    done(null, result);
                }
            },
            // Save Data
            (result, done) => {
                const newGroup = new groupModel(result.saveData);
                newGroup.save((err, saved) => {
                    result.createdGroup = saved.toObject();
                    result.createdGroup.id = saved._id;
                    delete result.createdGroup._id;
                    done(err, result);
                });
            },
            // Add groupid to the groups field of user model which added to group
            (result, done) => {
                Group.addGroupToUser(users, result.createdGroup.id, (err) => {
                    done(err, result);
                });
            },
            // Update organization disk usage
            (result, done) => {
                const file = result.saveData.avatar;
                if (file) {
                    const size = file.picture.size + file.thumbnail.size;
                    UpdateOrganizationDiskUsageLogic.update(organizationId, size, (err, updated) => {
                        done(err, result);
                    });
                } else {
                    done(null, result);
                }
            }
        ], (err,result) => {
            if(err){
                if(onError) onError(err);
                return;
            }
            if(onSuccess) onSuccess(result.createdGroup);
        });  
    },
    getDetails: (groupId, fields, onSuccess, onError) => {
        const groupModel = GroupModel.get();
        groupModel.findOne({ _id: groupId }, fields, (err,foundGroup) => {
            if(err && onError) return onError(err);
            result = foundGroup.toObject();
            result.id = foundGroup._id;
            delete result._id;
            if(onSuccess) onSuccess(result);
        });
    },
    update: (groupId, baseUser, name, sortName, description, avatar, onSuccess, onError) => {
        const groupModel = GroupModel.get();        
        async.waterfall([
            (done) => {
                // get original data
                groupModel.findOne({_id: groupId}, (err, original) => {
                    done(err, {original: original});
                });
            },
            (result, done) => {
                const newName = name ? name : result.original.name;
                const newDescription = description ? description : result.original.description;
                const newSortName = sortName ? sortName : newName.toLowerCase();                    
                result.updateParams = {
                    name: newName,
                    sortName: newSortName,
                    description: newDescription,
                };
                if (avatar) {
                    easyImg.thumbnail({
                        src: avatar.path,
                        dst: Path.dirname(avatar.path) + "/" + Utils.getRandomString(),
                        width: Const.thumbSize,
                        height: Const.thumbSize
                    }).then(
                        (thumbnail) => {
                            result.updateParams.avatar = {
                                picture: {
                                    originalName: avatar.name,
                                    size: avatar.size,
                                    mimeType: avatar.type,
                                    nameOnServer: Path.basename(avatar.path)
                                },
                                thumbnail: {
                                    originalName: avatar.name,
                                    size: thumbnail.size,
                                    mimeType: thumbnail.type,
                                    nameOnServer: thumbnail.name
                                }
                            };

                            done(null, result);
                        }, (err) => {
                            done(err, result);
                        }
                    );
                } else {
                    done(null, result);
                }
            },
            // Update data
            (result, done) => {
                groupModel.update({ _id: groupId }, result.updateParams, (err, updated) => {
                    done(err, result);
                });
            },
            // Update organization disk usage
            (result, done) => {
                if (avatar) {
                    let size = 0;
                    const newSize = result.updateParams.avatar.picture.size + result.updateParams.avatar.thumbnail.size;                    
                    if (result.original.avatar.picture.size) {
                        const originalSize = result.original.avatar.picture.size + result.original.avatar.thumbnail.size;
                        size = newSize - originalSize;
                    } else {
                        size = newSize;
                    }
                    UpdateOrganizationDiskUsageLogic.update(baseUser.organizationId, size, (err, updated) => {
                        done(err, result);
                    });
                } else {
                    done(null, result);
                }
            }
        ],
        (err, result) => {
            if(err && onError) return onError(err);
            if(onSuccess) onSuccess(result);
        });    
    },
    delete: (group, user, onSuccess, onError) =>  {
        const groupModel = GroupModel.get();
        async.waterfall([
            (done) => {
                groupModel.remove({_id: group.id}, (err, deleted) => {
                    done(err, { group: group });
                });
            },
            // Update organization disk usage
            (result, done) => {
                const pictureSize = result.group.avatar.picture.size;
                const thumbnailSize = result.group.avatar.thumbnail.size;
                if (pictureSize) {
                    let size = - (pictureSize + thumbnailSize);
                    UpdateOrganizationDiskUsageLogic.update(user.organizationId, size, (err, updated) => {
                        done(err, result);
                    });
                } else {
                    done(null, result);
                }
            },
            // remove group from user's groups
            (result, done) => {
                const userModel = UserModel.get();
                _.each(group.users, (user) => {
                    userModel.update({_id: user, groups: group.id}, {$pull: {groups: group.id}}, (err, updated) => {
                        done(err, result);
                    });
                });
            },
            // remove history
            (result, done) => {
                const historyModel = HistoryModel.get();                
                historyModel.remove({chatId: group.id}, (err, deleted) => {
                    done(err, result);
                });
            }
        ],
        (err, result) => {
            if(err && onError) return onError(err);
            if(onSuccess) onSuccess(result);
        });
    },
    addGroupToUser: (newUsers, groupId, callback) => {
        if (newUsers) {
            const userModel = UserModel.get();
            _.each(newUsers, (userId, index) => {
                userModel.findOne({_id: userId}, {groups:1}, (err, foundUser) => {
                    if (err) return done(err, result);
                    let groups = [];
                    groups.push(foundUser.groups, groupId);
                    groups = _.flatten(groups);       
                    groups = _.compact(groups);
                    foundUser.groups = _.uniq(groups);
                    foundUser.save();
                }); 
            });
            callback(null);                    
        } else {
            done(null);
        }
    }
};

module["exports"] = Group;