/**  Search User */

var _ = require('lodash');
var async = require('async');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var Utils = require("../lib/utils");

var DatabaseManager = require('../lib/DatabaseManager');
var SocketAPIHandler = require('../SocketAPI/SocketAPIHandler');

var PermissionLogic = require('./Permission');
var GetUserOnlineStatus = require('./GetUserOnlineStatus');

var UserModel = require('../Models/User');
var RoomModel = require('../Models/Room');
var GroupModel = require('../Models/Group');
var HistoryModel = require('../Models/History');
var OrganizationModel = require( '../Models/Organization');

var SearchUser = {
    
    search: function(baseUser,keyword,page,onSuccess,onError){
        
        if(/.*@.*/.test(keyword)){
            this.searchPerson(baseUser,keyword,page,onSuccess,onError);
        } else {
            this.searchOrganization(baseUser,keyword,page,onSuccess,onError);
        }

    },
    
    searchPerson:function(baseUser,keyword,page,onSuccess,onError){
        
        var splitted = keyword.split("@");
        
        var userId = splitted[0];
        var organiztionId = splitted[1];
        
        if(!userId || !organiztionId){
            
            onSuccess({
                list:[],
                count:0
            });
            
            return;
            
        }
        
        async.waterfall([
            function(done){
                
                var result ={};
                
                var organizationModel = OrganizationModel.get();
                
                organizationModel.findOne({organizationId:organiztionId},function(err,organizationResult){
                    
                    result.organization = organizationResult;
                    
                    if(organizationResult){
                        done(err,result)
                    }else{
                        done("no organization",result)
                    }
                    
                    
                });
                
                
            },
            function(result,done){
                
                var userModel = UserModel.get();
                
                userModel.findOne({
                    userid:userId,
                    organizationId:result.organization._id
                },function(err,userResult){
                    
                    result.user = userResult;
                    done(err,result)
                    
                });
                
            },
            function(result,done){

                done(null,result);
                
            }
        ],
        function(err,result){

            if(result.user && result.organization){

                onSuccess({
                    list:[result.user],
                    count:1
                });
                
            }else{

                onSuccess({
                    list:[],
                    count:0
                });
                
            }
                
        });
        

    },
    searchOrganization:function(baseUser,keyword,page,onSuccess,onError){
        
        var user = baseUser;
        var organizationId = baseUser.organizationId;
        var model = UserModel.get();

        async.waterfall([

            function(done) {

                // get departments
                PermissionLogic.getDepartments(user._id.toString(), function(departments) {

                    done(null, { groups: _.union(user.groups, departments) });
                    
                });

            },
            function(result, done){
                
                var conditions = {
                    organizationId: organizationId,
                    status : 1,
                    groups: { $in: result.groups },
                    _id: { $ne: user._id }
                };
                
                if(!_.isEmpty(keyword)){
                    conditions['$or'] = [
                        { name: new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i") },
                        { sortName: new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i") },
                        { description: new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i") },
                    ];
                }
                
                var query = model.find(conditions)
                .skip(Const.pagingRows * page)
                .sort({'sortName': 'asc'})
                .limit(Const.pagingRows);        
                
                query.exec(function(err,data){
                    
                    if(err){
                        done(err,null);
                        return;
                    }
                    data = data.map(function(item){
                        return item.toObject();
                    });

                    result.list = data;
                    
                    done(err,result);
                    
                }); 
            
            },
            function(result,done){

                var conditions = {
                    organizationId: organizationId,
                    status : 1,
                    groups: { $in: result.groups },
                    _id: { $ne: user._id }
                };
                
                if(!_.isEmpty(keyword)){
                    conditions['$or'] = [
                        { name: new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i") },
                        { description: new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i") },
                    ];
                }
                
                model.count(conditions,function(err,countResult){
                    
                    result.count = countResult;
                    
                    done(null,result);

                });
                
            },
            function(result, done) {
                
                var userIds = _.pluck(result.list,'_id');
                
                GetUserOnlineStatus.get(userIds,function(err,onlineStatusResult){
                    
                    _.forEach(onlineStatusResult,function(row){
                        
                        if(!row.userId) 
                            return;
                        
                        var key = _.findKey(result.list,function(userForKey){
                            
                            return userForKey._id == row.userId;
                            
                        });
                        
                        result.list[key].onlineStatus = row.onlineStatus;
                        
                    });
                    
                    done(null,result);
                        
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


module["exports"] = SearchUser;

