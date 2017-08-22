/** Retuens groups and rooms for user */

var _ = require('lodash');
var async = require('async');

var Const = require("../../lib/consts");
var Config = require("../../lib/init");
var Utils = require("../../lib/utils");

var DatabaseManager = require("../../lib/DatabaseManager");

var UserModel = require('../../Models/User');
var RoomModel = require('../../Models/Room');
var GroupModel = require('../../Models/Group');
var HistoryModel = require('../../Models/History');

var Permission = {
    
    getGroupsJoined : function(userId, callBack) {
        
        var self = this;
        
        var userModel = UserModel.get();
        
        async.waterfall([function(done){
            
            var result = {
                groups: []
            };
            
            // get latest user info
            userModel.findOne({_id: userId},function(err,findResult){
               
                if(findResult){

                    result.user = findResult;
                    done(null,result)
            
                } else {
                    
                    done('invalid userid',null);
                    
                }
                
            });

        },
        function(result,done){
            
            // get normal groups
            result.groups = result.groups.concat(result.user.groups);
            
            done(null,result)
        },
        function(result,done){
            
            // Jura napravi ovdje da doda grupe iz department-a , još POD departmen.
            self.getDepartments(result.user._id,function(departments){
                
                result.groups = result.groups.concat(departments);
                done(null,result);
                
            });
           
        }
        ],
        function(err,result){
            
            if(err && callBack)
                callBack(null);
            
            else if(callBack)
                callBack(result.groups);
                
            
        });
        
    },
    
    getRoomsJoined : function(userId, callBack) {
        
        var roomModel = RoomModel.get();
        
        roomModel.find({
            users: userId
        },function(err,findResult){
            
            var roomIds = _.map(findResult,function(room){
                
                return room._id.toString();
                    
            });
            
            if(err && callBack)
                callBack(null);
            
            else if(callBack)
                callBack(roomIds);
             
        });
        
    },
    
    getDepartments : function(userId, callBack) {
        
        var userModel = UserModel.get();
        var groupModel = GroupModel.get();

        async.waterfall([

            function(done){
                
                // get latest user info
                userModel.findOne({ _id: userId },function(err,findResult){
                   
                    if(findResult){

                        done(null, { user: findResult });
                
                    } else {
                        
                        done('invalid userid', null);
                        
                    }
                    
                });

            },
            function(result, done) {
                
                // get departments
                groupModel.find({ 

                    organizationId: result.user.organizationId,
                    type: Const.groupType.department 

                    }, 
                    { parentId: true },
                function(err, findResult) {
                    
                    result.departments = findResult.map(function(item){
                        return item.toObject();
                    });

                    done(err, result);
                
                });

            },
            function(result, done) {

                var departmentIds = [];

                _.forEach(result.user.groups, function(groupId, index) { 

                    if (!_.isEmpty(_.filter(result.departments, { _id: DatabaseManager.toObjectId(groupId) }))) {

                        departmentIds.push(groupId.toString());

                        getDepartments(_.filter(result.departments, { parentId: groupId.toString() }));

                    }
                
                });

                function getDepartments(data) {

                    _.forEach(data, function(department, index) { 

                        departmentIds.push(department._id.toString());

                        getDepartments(_.filter(result.departments, { parentId: department._id.toString() }));

                    });

                };

                result.departments = _.uniq(departmentIds);
                done(null, result);

            }
        ],
        function(err, result) {
            
            if(err && callBack)
                callBack(null);
            
            else if(callBack)
                callBack(result.departments);
            
        });
        
    },

    getUserBySessionUserId : function(userId, callBack) {
        
        var self = this;
        
        var userModel = UserModel.get();
        
        async.waterfall([

            function(done) {

                // get latest user info
                userModel.findOne({ _id: userId },function(err,findResult){
                   
                    if(findResult) {

                        done(null, findResult.toObject());
                
                    } else {
                        
                        done(self.l10n('invalid userid'), null);
                        
                    }
                    
                });

            },
            function(result, done) {

                // get departments
                self.getDepartments(userId, function(departments) {

                    result.defaultDepartments = _.intersection(result.groups, departments);                        
                    result.groups = _.union(result.groups, departments);
                    done(null, result);
                    
                });

            }
        ],
        function (err, result) {

            if(err && callBack)
                callBack(null);
            
            else if(callBack)
                callBack(result);
            
        });
        
    },

    getAboveDepartments : function(organizationId, groupId, callBack) {
        
        var groupModel = GroupModel.get();

        async.waterfall([

            (done) => {
                
                // get all departments
                groupModel.find({ 
                    organizationId: organizationId, 
                    type: Const.groupType.department 
                }, { 
                    _id: 1, 
                    parentId: 1 
                }, (err, findResult) => {

                    done(err, { departments: findResult });

                });

            },
            (result, done) => {

                var departmentIds = [];

                // get departments that are above of current department
                function getAboveDepartments(data) {

                    _.forEach(data, (value, index) => { 

                        departmentIds.push(value._id.toString());
                        getAboveDepartments(_.filter(result.departments, { _id: DatabaseManager.toObjectId(value.parentId) }));

                    });

                    return departmentIds;
                };

                result.departments = getAboveDepartments(_.filter(result.departments, { _id: DatabaseManager.toObjectId(groupId) }));
                done(null, result);

            }
        ],
        (err, result) => {
            
            if(err && callBack)
                callBack(null);
            
            else if(callBack)
                callBack(result.departments);
            
        });
        
    }

};


module["exports"] = Permission;