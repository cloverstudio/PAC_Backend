/** Create group */
const async = require('async');
const Const = require("../../lib/consts");
const Utils = require("../../lib/utils");
const Path = require('path');
const GroupModel = require('../../Models/Group');
const OrganizationModel = require('../../Models/Organization');
const UpdateOrganizationDiskUsageLogic = require('./UpdateOrganizationDiskUsage')

const CreateGroup = {
    
    create: (baseUser, name, sortName, description, users, avatar, onSuccess, onError) => {
        
        const groupModel = GroupModel.get();
        const organizationId = baseUser.organizationId;

        async.waterfall([
            // Get latest organization data
            (done) => {
                let result = {};
                const organizationModel = OrganizationModel.get();                
                organizationModel.findOne({_id: organizationId}, (err, organization) => {
                    result.organization = organization;
                    done(err, result);
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
                    const easyImg = require('easyimage');
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

};


module["exports"] = CreateGroup;