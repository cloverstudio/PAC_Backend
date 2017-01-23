var async = require('async');
var path = require('path');
var mime = require('mime');
var fs = require('fs-extra');

var Utils = require("../lib/Utils");
var Const = require("../const");
var Settings = require("../lib/Settings");
var DatabaseManager = require("../lib/DatabaseManager");

var SaveFile = {
    execute : function(file,callBack){

        async.waterfall([function(done){
            
            var tempPath = file.path;
            var fileName = file.name;

            // save to database
            var newFile = new DatabaseManager.fileModel({
                name:fileName,
                mimeType: file.type,
                size: file.size,
                created: Utils.now()                   
            });
                                            
            newFile.save(function(err,fileModel){
                                        
                done(err,{
                    file:file,
                    fileModel:fileModel
                });
            
            });

        },
        function(result,done){

            var tempPath = result.file.path;
            var fileName = result.file.name;

            var destPath = Settings.options.uploadDir;


            fs.copy(tempPath, destPath + "/" + result.fileModel._id, function(err) {
            
                if (err){
                    
                    done(err,null);
                    
                } else {
                            
                    done(err,result);
                    
                }
            
            });

        },
        function(result,done){


                var file = result.file;
                             
                if(file.type.indexOf("jpeg") > -1 ||
                    file.type.indexOf("gif") > -1 ||
                    file.type.indexOf("png") > -1){
                    
                        var easyimg = require('easyimage');
                        var tempThumbFileName = result.fileModel.id + "_thumb.jpg"; // force to be jpg
                        var destPathTmp = Settings.options.uploadDir + tempThumbFileName;
                        var fileName = result.file.name;

                        easyimg.thumbnail({
                                src: file.path, dst:destPathTmp,
                                width:256, height:256
                            }).then(
                            function(image) {
                                
                                // save to database
                                var thumbObj = new DatabaseManager.fileModel({
                                    name:"thumb_" + fileName,
                                    mimeType: "image/jpeg",
                                    size: image.size,
                                    created: Utils.now()                   
                                });
                                                             
                                thumbObj.save(function(err,thumbModel){

                                    var thumbFileName = thumbModel._id
                                    var destPath = Settings.options.uploadDir + "/" + thumbFileName;
        
                                    // rename
                                    fs.rename(destPathTmp, destPath, function(){
                                    
                                        result.thumbModel = thumbModel;
                                        
                                        done(err,result);
                                    });

                                
                                });

                            },
                            function (err) {
                                // ignore thubmnail error
                                console.log(err);
                                done(null,result);
                            }
                        );
                    
                } else {
                    
                    done(null,result);
                    
                }


        },
        function(result,done){
            done(null,result);

        }
        ],
        function(err,result){

            if(!callBack)
                return;
            
            callBack(err,result);

        });

    }
}

module["exports"] = SaveFile;