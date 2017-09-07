/** Create User */
const async = require('async');
const _ = require('lodash');
const Const = require("../../lib/consts");
const Utils = require("../../lib/utils");
const Path = require('path');
const easyImg = require('easyimage');
const UserModel = require('../../Models/User');
const GroupModel = require('../../Models/Group');
const HistoryModel = require('../../Models/History');
const OrganizationModel = require('../../Models/Organization');
const UpdateOrganizationDiskUsageLogic = require('./UpdateOrganizationDiskUsage')
const PermissionLogic = require('./Permission');
const NewUserLogic = require('./NewUser');

const User = {
    create: (baseUser, fields, avatar, onSuccess, onError) => {
        const userModel = UserModel.get();
        const groupModel = GroupModel.get();
        const organizationId = baseUser.organizationId;
        async.waterfall([
            // Get organization
            (done) => {
                const organizationModel = OrganizationModel.get();                
                organizationModel.findOne({_id: organizationId}, (err, organization) => {
                    done(err, { organization: organization });
                });
            },
            // Get groups
            (result, done) => {
                const conditions = {
                    organizationId: organizationId,
                    type: Const.groupType.group
                }
                if (baseUser.permission != Const.userPermission.organizationAdmin)
                    conditions._id = { $in: baseUser.groups }

                groupModel.find(conditions, {name:true, parentId:true}, (err, groups) => {
                    result.groups = groups;
                    done(err, result);
                });
            },
            // Check number of Users in organization   
            (result, done) => {
                userModel.count({ organizationId: organizationId}, (err, numberOfUsers) => {
                    if (numberOfUsers >= result.organization.maxUserNumber) { 
                        err = 'You can\'t add more Users to this organization. Maximum number of Users in this organization is ' + 
                        result.organization.maxUserNumber + '.';
                    }
                    done(err, result);
                });
            },
            (result, done) => {
                NewUserLogic.create(
                    fields.name, 
                    fields.sortName, 
                    fields.description,
                    fields.userid, 
                    fields.password, 
                    fields.status, 
                    organizationId, 
                    baseUser.permission,
                    _.isEmpty(fields.groups) ? [] : fields.groups, avatar,
                    (err, created) => {
                        result.created = created.user.toObject();
                        result.created.id = created.user._id;
                        delete result.created._id;
                        done(err, result);
                    }
                );
            }
        ], (err,result) => {
            if(err){
                if(onError) onError(err);
                return;
            }
            if(onSuccess) onSuccess(result.created);
        });  
    }
};

module["exports"] = User;