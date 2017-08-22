/** Search group */

var _ = require('lodash');
var async = require('async');

var Const = require("../../lib/consts");
var Config = require("../../lib/init");
var Utils = require("../../lib/utils");

var DatabaseManager = require('../../lib/DatabaseManager');
var SocketAPIHandler = require('../../SocketAPI/SocketAPIHandler');

var UserModel = require('../../Models/User');
var RoomModel = require('../../Models/Room');
var GroupModel = require('../../Models/Group');
var HistoryModel = require('../../Models/History');

var PermissionLogic = require('./Permission');

var SearchGroup = {
    
    search: (user, keyword, offset, limit, sort, fields, onSuccess, onError) => {

        var organizationId = user.organizationId;
        var model = GroupModel.get();

        async.waterfall([
            (done) => {
                // get departments
                PermissionLogic.getDepartments(user._id.toString(), (departments) => {
                    done(null, { departmentIds: departments });
                });
            },
            // Get groups
            (result, done) => {
                var conditions = {
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

                var query = model.find(conditions, fields)
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
                var userLists = _.pluck(result.list,'users');
                if (_.contains(userLists, undefined)) done(null, result);
                
                var userIds = [];
                _.forEach(userLists, (userList) => {
                    if(!_.isArray(userList)) return;
                    userIds = userIds.concat(userList);
                });
                userIds = _.uniq(userIds);

                var userModel = UserModel.get();
                userModel.find({_id: {$in:userIds}}, {name:1}, (err, foundUsers) => {
                    foundUsers = foundUsers.map((item) => {
                        return item.toObject();
                    });
                    // Replace users list to list including username
                    _.forEach(result.list, (group, index) => {
                        var userModels = _.filter(foundUsers, (user) => {
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