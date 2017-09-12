/** Create Avatar */
const async = require('async');
const _ = require('lodash');
const Const = require("../../lib/consts");
const Config = require("../../lib/init");
const Utils = require("../../lib/utils");
const Path = require('path');
var fs = require('fs-extra');
const easyImg = require('easyimage');

const Avatar = {
    createAvatarData: (avatar, callback) => {
        easyImg.thumbnail({
            src: avatar.path,
            dst: Path.dirname(avatar.path) + "/" + Utils.getRandomString(),
            width: Const.thumbSize,
            height: Const.thumbSize
        }).then(
            (thumbnail) => {
                avatarData = {
                    picture: {
                        originalName: avatar.name,
                        size: avatar.size,
                        mimeType: avatar.type,
                        nameOnServer: Path.basename(avatar.path)
                    },
                    thumbnail: {
                        originalName: avatar.name,
                        size: thumbnail.size,
                        mimeType: thumbnail.type,
                        nameOnServer: thumbnail.name
                    }
                };
                callback(null, avatarData);
            }, (err) => {
                callback(err, null);
            }
        );
    },
    createRoomAvatarData: (file, callback) => {
        async.waterfall([
            (done) => {
            let result = {};
            // save to upload dir
            const tempPath = file.path;
            const fileName = file.name;
            const destPath = Config.uploadPath + "/";
            const newFileName = Utils.getRandomString(32);                
            result.newFileName = newFileName;
            fs.copy(tempPath, destPath + newFileName, function(err) {
                easyImg.rescrop({src:destPath + newFileName, dst:destPath + newFileName,
                    width:512, height:512,
                    cropwidth:512, cropheight:512,
                    x:0, y:0
                }).then(function(image) {
                    easyImg.convert({src: destPath + newFileName, dst: destPath + newFileName + ".png", quality:100}).then(function (file) {
                        fs.rename( destPath + newFileName + ".png", 
                                destPath + newFileName, function(err) {
                            done(err,result);
                        });
                    });
                });
            });
        },
        (result,done) => {
            // generate thumbnail      
            if(file.type.indexOf("jpeg") > -1 || file.type.indexOf("gif") > -1 || file.type.indexOf("png") > -1){
                    const thumbFileName = Utils.getRandomString(32); 
                    result.thumbName = thumbFileName;
                    const destPathTmp = Config.uploadPath + "/" + thumbFileName;
    
                    easyImg.thumbnail({
                            src: Config.uploadPath + "/" + result.newFileName, 
                            dst:destPathTmp + ".png",
                            width:Const.thumbSize, height:Const.thumbSize
                        }).then(
                        function(image) {
                            fs.rename(destPathTmp + ".png", destPathTmp, (err) => {
                                done(err,result);
                            });
                        },
                        (err) => {
                            // ignore thubmnail error
                            console.log(err);
                            done(err, result);
                        }
                    );
            } else {
                done(null, result);
            }
        }],
        (err,result) => {
            const stats = fs.statSync(Config.uploadPath + "/" + result.thumbName);
            if(result.thumbName && result.newFileName){
                callback(err, {
                    picture: {
                        originalName:file.name,
                        size:file.size,
                        mimeType:"image/png",
                        nameOnServer:result.newFileName
                    },
                    thumbnail: {
                        originalName:file.name,
                        size:stats["size"],
                        mimeType:"image/png",
                        nameOnServer:result.thumbName
                    }
                });
            }else{
                callback(err, null);
            }
        });  
    }
};

module["exports"] = Avatar;