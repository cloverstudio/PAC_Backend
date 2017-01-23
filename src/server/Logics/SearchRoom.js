/**  Search Room */

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

var SearchRoom = {
    
    search: function(baseUser,keyword,page,onSuccess,onError){
        
        var user = baseUser;
        var model = RoomModel.get();
        
        async.waterfall([

            function(done){
                
                var result = {};
                
                var conditions = {
                    users: user._id.toString(),
                };
                
                if(!_.isEmpty(keyword)){
                    conditions['$or'] = [
                        { name: new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i") },
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
                    users: user._id.toString(),
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


module["exports"] = SearchRoom;

