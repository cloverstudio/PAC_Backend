/** Called for /api/v2/room/users/:roomId/:page API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var Utils = require( pathTop + 'lib/utils');
var RoomModel = require( pathTop + 'Models/Room');
var UserModel = require( pathTop + 'Models/User');
var OrganizationModel = require( pathTop + 'Models/Organization');
var GetUserOnlineStatus = require( pathTop + 'Logics/GetUserOnlineStatus');
var tokenChecker = require( pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var RoomUsersController = function(){
}

_.extend(RoomUsersController.prototype,BackendBase.prototype);

RoomUsersController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v2/room/users/:roomId/:page RoomUserList
     * @apiName RoomUserList
     * @apiGroup WebAPI
     * @apiDescription Returns users of the room. If send "all" text as page param, it returns all user.
     * @apiHeader {String} access-token Users unique access-token.
     * @apiSuccessExample Success-Response:


{ code: 1,
  time: 1457096396842,
  data: 
   { count: 4,
     list: 
      [ { _id: '56d986cbfc6914974deb7676',
          name: 'test',
          userid: 'userid17RH5J',
          password: '*****',
          organizationId: '56d986cbfc6914974deb7675',
          created: 1457096395204,
          status: 1,
          __v: 0,
          tokenGeneratedAt: 1457096395644,
          token: '*****',
          description: null,
          departments: [],
          groups: [],
          avatar: 
           { thumbnail: 
              { originalName: 'max.jpg',
                size: 64914,
                mimeType: 'image/png',
                nameOnServer: 'dDCn5wYHP7d8RkkwvoaTZxdckv8IRqDX' },
             picture: 
              { originalName: 'max.jpg',
                size: 64914,
                mimeType: 'image/png',
                nameOnServer: 'RChBqbqMVD7ScoaTUcc2iSvVRTuoJybp' } } },
        { _id: '56d986cbfc6914974deb7677',
          name: 'User2',
          userid: 'userid22eVJu',
          password: '*****',
          organizationId: '56d986cbfc6914974deb7675',
          created: 1457096395215,
          status: 1,
          __v: 0,
          tokenGeneratedAt: 1457096395639,
          token: '*****',
          description: null,
          departments: [],
          groups: [],
          avatar: 
           { thumbnail: 
              { originalName: 'user1.jpg',
                size: 36023,
                mimeType: 'image/png',
                nameOnServer: 'l4GFBU2lzNa42q7Rymx31q96u3XpgPbV' },
             picture: 
              { originalName: 'user1.jpg',
                size: 36023,
                mimeType: 'image/png',
                nameOnServer: 'ThremyfFhXrP6YlqxOAzva52Jpx7ulfx' } } },
        { _id: '56d986cbfc6914974deb7678',
          name: 'User3',
          userid: 'userid3RP0zE',
          password: '*****',
          organizationId: '56d986cbfc6914974deb7675',
          created: 1457096395221,
          status: 1,
          __v: 0,
          tokenGeneratedAt: 1457096395640,
          token: '*****',
          description: null,
          departments: [],
          groups: [],
          avatar: 
           { thumbnail: 
              { originalName: 'user2.jpg',
                size: 53586,
                mimeType: 'image/png',
                nameOnServer: 'pILnZ13qS1PldslPmuGwPKC3FkwZrTP1' },
             picture: 
              { originalName: 'user2.jpg',
                size: 53586,
                mimeType: 'image/png',
                nameOnServer: 'Tqy2TWTJO9qblAixb578ZhiFOthENw7F' } } },
        { _id: '56d986cbfc6914974deb7679',
          name: 'User4',
          userid: 'userid4tIcLG',
          password: '*****',
          organizationId: '56d986cbfc6914974deb7675',
          created: 1457096395228,
          status: 1,
          __v: 0,
          tokenGeneratedAt: 1457096395644,
          token: '*****',
          description: null,
          departments: [],
          groups: [],
          avatar: 
           { thumbnail: 
              { originalName: 'user3.png',
                size: 54101,
                mimeType: 'image/png',
                nameOnServer: 'Pit9pVfi3jVuWG2HbvlCoZzPOg8xQJwg' },
             picture: 
              { originalName: 'user3.png',
                size: 54101,
                mimeType: 'image/png',
                nameOnServer: 'Kvay7NvUPMvMiYkjPJvOogcVNLJZgejO' } } } ] } }
                

**/
    
    router.get('/:roomId/:page',tokenChecker,function(request,response){
        
        var roomModel = RoomModel.get();
        var userModel = UserModel.get();

        var roomId = request.params.roomId;
        
        var page = 0;
        var getAll = false;
        if(/^[0-9]+$/.test(request.params.page))
            page = request.params.page - 1;
        else if(request.params.page == 'all')
            getAll = true;

        async.waterfall([function(done){
            
            var result = {};
            

            if(!roomId){
                self.successResponse(response,Const.responsecodeRoomDetailInvalidRoomId);
                return;
            }
            
            roomModel.findOne({_id:roomId},function(err,roomFindResult){
                
                if(!roomFindResult){
                    self.successResponse(response,Const.responsecodeRoomDetailInvalidRoomId);
                    return;
                }
                
                result.room = roomFindResult.toObject();
                
                done(err,result);
                 
            });

        },
        function(result,done){

            var query = null;
            
            if(getAll){
                
                query = userModel.find({
                    _id : {$in:result.room.users}
                })
                .sort({ "sortName": "asc" });
                
            }else{
                
                query = userModel.find({
                    _id : {$in:result.room.users}
                })
                .sort({ "sortName": "asc" })
                .skip(Const.pagingRows * page)
                .limit(Const.pagingRows);
                
            }
            
            query.exec(function(err, data) {

                data = data.map(function(item){
                    return item.toObject();
                });
                
                result.list = data;
                
                done(err,result);
                
            }); 
        
        },
        function(result,done){
            
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
                console.log("critical err",err);
                self.errorResponse(response,Const.httpCodeServerError);
                return;
            }
            
            self.successResponse(response,Const.responsecodeSucceed,{
                count: result.room.users.length,
                list : result.list
            });
            
        });
        
    });
   
    return router;

}

module["exports"] = new RoomUsersController();
