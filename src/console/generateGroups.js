/** Generate groups for testing purpose  */

var fs = require('fs-extra');
var _ = require('lodash');
var sha1 = require('sha1');
var http = require('http');
var Stream = require('stream').Transform;
var async = require('async');

var DatabaseManager = require('../server/lib/DatabaseManager');
var UserModel = require('../server/Models/User');
var GroupModel = require('../server/Models/Group');

var Utils = require('../server/lib/utils');
var init = require('../server/lib/init');
var Const = require('../server/lib/consts');
var organizationId = '56d433e6c2e65e7903e42ed5';

init.uploadPath = init.uploadPath + "/";

DatabaseManager.init(function(success){
        
    if(!success){
        
        console.log('Failed to connect DB');
        process.exit(1);
        
    } else {

        fs.readFile(__dirname + '/SampleData/MOCK_DATA_Group.json', 'utf8', function (err, data) {
        
            if (err) throw err;
            
            var allData = JSON.parse(data);
            
            var groupModel = GroupModel.get();
            var userModel = UserModel.get();

            var counter = 0;
            
            async.eachSeries(allData, function(row,done){
                
                var groupName = row.group_name;
                var groupDescription = row.group_description;
                
                var filename = Utils.getRandomString(32);
                var thumbname = Utils.getRandomString(32);
                
                var url = 'http://lorempixel.com/512/512/';                    
                
                http.request(url, function(response) {  
                                                          
                    var data = new Stream();                                                    
                
                    response.on('data', function(chunk) {                                       
                        data.push(chunk);                                                         
                    });                                                                         
                
                    response.on('end', function() {
                                            
                    fs.writeFileSync(init.uploadPath + "/" + filename, data.read());
                    
                    // generate thumb
                    var easyimg = require('easyimage');
                    
                    easyimg.convert({src: init.uploadPath + "/" + filename, dst: init.uploadPath + "/" + filename + ".png", quality:100}).then(function (file) {
                                                
                        fs.renameSync( init.uploadPath + "/" + filename + ".png",init.uploadPath + filename);
                        
                        easyimg.thumbnail({
                                src: init.uploadPath + "/" + filename, 
                                dst: init.uploadPath + "/" + thumbname + ".png",
                                width:Const.thumbSize, height:Const.thumbSize
                            }).then(
                            
                                function(image) {
                                                                    
                                    fs.renameSync( init.uploadPath + "/" + thumbname + ".png",init.uploadPath + thumbname);
                                    
                                    var offSet = Math.floor(Math.random() * 1000);
                                    var limitMax = 1000 - offSet;
                                    var limit = Math.floor(Math.random() * limitMax);
                                    
                                    // select users
                                    userModel.find({organizationId:organizationId})
                                        .sort({'name': 'asc'})
                                        .skip(offSet)
                                        .limit(limit)
                                        .exec(function(err,usersData){
                                            
                                            var userIds = _.pluck(usersData,"_id");
                                            
                                            userIds = _.map(userIds,function(userId){
                                                
                                                return userId.toString();
                                                 
                                            });
                                            
                                            var model = null;
                                            
                                            if(Math.random() > 0.5){
                                                
                                                model = new groupModel({
                                                    organizationId:organizationId,
                                                    name:groupName,
                                                    sortName: groupName,
                                                    description: groupDescription,
                                                    avatar:{
                                                        picture: { 
                                                            originalName: filename, 
                                                            size: 1, 
                                                            mimeType: "image/png",
                                                            nameOnServer: filename
                                                        },
                                                        thumbnail: { 
                                                            originalName: thumbname, 
                                                            size: 1, 
                                                            mimeType: "image/png",
                                                            nameOnServer: thumbname
                                                        },
                                                    },
                                                    users:userIds,
                                                    created: Utils.now(),
                                                    type: 1          
                                                });
                                                
                                            } else {
                                                
                                                model = new groupModel({
                                                    organizationId:organizationId,
                                                    name:groupName,
                                                    sortName: groupName,
                                                    description: groupDescription,
                                                    users:userIds,
                                                    created: Utils.now(),        
                                                    type: 1          
                                                });
                                            }
                                    
                                            model.save(function(err,modelSaved){
                                                                                    
                                                if(err)
                                                    console.log(err);
                                                
                                                async.eachSeries(usersData, function(userData,doneUserUpdate){
                                                    
                                                    var groups = userData.groups;
                                                    if(!_.isArray(groups))
                                                        groups = [];
                                                    
                                                    groups.push(modelSaved._id.toString());

                                                    userData.update({
                                                        groups:groups
                                                    },{},function(err,updateResult){
                                                        doneUserUpdate(null);
                                                    });
                                                    
                                                },function(err){
                                                    
                                                    done(err);   
                                                    
                                                });

                                            });
                                            
                                        });
                            
                                },
                                function (err) {
                                    
                                    
                
                                } // function (err) {
                            
                            ); //  }).then(

                                                            
                        }); // easyimg.thumbnail({   
                        
                    }); //  easyimg.convert
                                                                                            
                }).end();//http.request
                
            }); //  async.each
                
        }); //fs.readFile

    } //} else {
    
}); // DatabaseManager.init
