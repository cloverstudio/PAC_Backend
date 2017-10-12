/** Search group */

var _ = require('lodash');
var async = require('async');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var Utils = require("../lib/utils");

var DatabaseManager = require('../lib/DatabaseManager');
var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');

var UserModel = require('../Models/User');
var RoomModel = require('../Models/Room');
var GroupModel = require('../Models/Group');
var HistoryModel = require('../Models/History');

var PermissionLogic = require('./Permission');

var SearchGroup = {
    
    search: function(baseUser,keyword,page,onSuccess,onError){
        
        var user = baseUser;
        var organizationId = user.organizationId;
        var model = GroupModel.get();
        
        async.waterfall([

            function(done) {

                // get departments
                PermissionLogic.getDepartments(user._id.toString(), function(departments) {

                    done(null, { departmentIds: departments });
                    
                });

            },
            function(result, done) {
                
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
                                {
                                    name: new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i")
                                },
                                {
                                    description: new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i")
                                }
                            ]
                       }
                    );
                }
                
                var query = model.find(conditions)
                .skip(Const.pagingRows * page)
                .sort({ 'sortName': 'asc' })
                .limit(Const.pagingRows);        
                
                query.exec(function(err,data){

                    data = data.map(function(item){
                        return item.toObject();
                    });
                    
                    result.list = data;
                    
                    done(err,result);
                    
                }); 
            
            },
            function(result,done){

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
                                {
                                    name: new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i")
                                },
                                {
                                    description: new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i")
                                }
                            ]
                       }
                    );
                }
                
                model.count(conditions, function(err, countResult) {
                    
                    result.count = countResult;
                    
                    done(null,result);

                });
                
            },
            function(result,done){
                
                // get users
                var userIds = [];
                
                result.list.forEach( (group) => {

                    userIds = userIds.concat( group.users );

                });
                
                userIds = _.unique(userIds);
                
                var userModel = UserModel.get();
                
                userModel.find({_id:{$in:userIds}},function(err,userFindResult){
                    
                    userFindResult = userFindResult.map(function(item){
                        return item.toObject();
                    });
                                
                    _.forEach(result.list,function(row,index){
                        
                        row.users = _.unique(row.users);
                        
                        var userModels = _.filter(userFindResult,function(userModel){

                            if(_.isArray(row.users))
                                return row.users.indexOf(userModel._id.toString()) != -1;
                            
                        });
                        
                        console.log(userModels.length,row.users.length);
                        
                        result.list[index].usersCount =  row.users.length;
                        result.list[index].userModels =  userModels.slice(0,4);

                    });
                    
                    done(err,result);
                    
                });
                
            }
        ],
        function(err,result){

            if(err){
                if(onError)
                    onError(err);
                
                return;
            }
            
            if(onSuccess)
                onSuccess(result);
            
            
        });  
        
    }
    
};


module["exports"] = SearchGroup;