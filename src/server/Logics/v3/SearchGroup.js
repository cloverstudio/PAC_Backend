/** Search group */

const _ = require('lodash');
const async = require('async');

const Config = require("../../lib/init");
const Utils = require("../../lib/utils");

const DatabaseManager = require('../../lib/DatabaseManager');

const UserModel = require('../../Models/User');
const RoomModel = require('../../Models/Room');
const GroupModel = require('../../Models/Group');
const HistoryModel = require('../../Models/History');

const PermissionLogic = require('./Permission');

const SearchGroup = {
    
    search: (user, keyword, offset, limit, sort, fields, onSuccess, onError) => {

        const organizationId = user.organizationId;
        const model = GroupModel.get();
        
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

                const query = model.find(conditions, fields)
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
    }
};


module["exports"] = SearchGroup;