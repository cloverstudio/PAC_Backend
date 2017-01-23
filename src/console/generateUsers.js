/** Generate users for testing purpose  */

var fs = require('fs-extra');
var _ = require('lodash');
var sha1 = require('sha1');
var http = require('http');
var Stream = require('stream').Transform;
var async = require('async');

var DatabaseManager = require('../server/lib/DatabaseManager');
var UserModel = require('../server/Models/User');

var Utils = require('../server/lib/utils');
var init = require('../server/lib/init');
var Const = require('../server/lib/consts');

var organizationId = '56bb25bf1a4c6acb06cbbb59';

init.uploadPath = init.uploadPath + "/";

DatabaseManager.init(function(success){
        
    if(!success){
        
        console.log('Failed to connect DB');
        process.exit(1);
        
    } else {

        fs.readFile(__dirname + '/SampleData/MOCK_DATA.json', 'utf8', function (err, data) {
        
            if (err) throw err;
            
            var allData = JSON.parse(data);
            
            var userModel = UserModel.get();
            var counter = 0;

            async.eachSeries(allData, function(row,done){


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
        
                                    var model = new userModel({
                                        organizationId:organizationId,
                                        name:row.first_name + " " + row.last_name,
                                        description: row.email,
                                        userid: row.username,
                                        password: Utils.getHash('yumiko'),
                                        status: 1,
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
                                        created: Utils.now()          
                                    });
                            
                                    model.save(function(err,modelSaved){
                                                                            
                                        if(err)
                                            console.log(err);

                                        done(err);              
                                    
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
