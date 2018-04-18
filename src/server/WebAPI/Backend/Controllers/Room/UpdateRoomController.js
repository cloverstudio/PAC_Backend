/** Called for /api/v2/room/update API */

var express = require('express');
var router = express.Router();
var sha1 = require('sha1');
var bodyParser = require("body-parser");
var _ = require('lodash');
var async = require('async');
var validator = require('validator');
var fs = require('fs-extra');
var formidable = require('formidable');
var easyimg = require('easyimage');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var Config = require(pathTop + "lib/init");
var DatabaseManager = require(pathTop + 'lib/DatabaseManager');
var Utils = require(pathTop + 'lib/utils');
var UserModel = require(pathTop + 'Models/User');
var RoomModel = require(pathTop + 'Models/Room');
var tokenChecker = require(pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var UpdateRoomController = function () { }

_.extend(UpdateRoomController.prototype, BackendBase.prototype);

UpdateRoomController.prototype.init = function (app) {

    var self = this;


    /**
      * @api {post} /api/v2/room/update Update Room Profile
      * @apiName Update Room Profile
      * @apiGroup WebAPI
      * @apiDescription Update profile of conversation
      * @apiHeader {String} access-token Users unique access-token.
      * @apiParam {string} roomId roomId
      * @apiParam {string} name Name to display
      * @apiParam {string} description Description
      * @apiParam {file} file avatar file
 
      * @apiSuccessExample Success-Response:
 {
     "code": 1,
     "time": 1457082886197,
     "data": {
         "room": {
             "_id": "56d94c88bf06a1f30ad6091d",
             "owner" : "56c32acd331dd81f8134f200"
             "ownerModel": {
                 "_id": "56c32acd331dd81f8134f200",
                 "name": "Ken",
                 "sortName": "ken yasue",
                 "description": "ああああ",
                 "userid": "kenyasue",
                 "password": "*****",
                 "created": 1455631053660,
                 "status": 1,
                 "organizationId": "56ab7b9061b760d9eb6feba3",
                 "__v": 0,
                 "tokenGeneratedAt": 1457082869691,
                 "token": "*****",
                 "departments": [],
                 "groups": ["56cf0a60ed51d2905e28a848"],
                 "avatar": {
                     "thumbnail": {
                         "originalName": "2015-01-11 21.30.05 HDR.jpg",
                         "size": 1551587,
                         "mimeType": "image/png",
                         "nameOnServer": "c2gQT5IMJAYqx89eo8gwFrKJSRxlFYFU"
                     },
                     "picture": {
                         "originalName": "2015-01-11 21.30.05 HDR.jpg",
                         "size": 1551587,
                         "mimeType": "image/png",
                         "nameOnServer": "jf7mBTsU6CVfFPLsnY4Ijqcuo6vYTKAs"
                     }
                 }
             },
             "name": "ああああああ",
             "created": 1457081480907,
             "__v": 0,
             "description": "いいいいいddd",
             "modified": 1457082886193,
             "avatar": {
                 "thumbnail": {
                     "originalName": "2014-06-03 17.23.39.jpg",
                     "size": 1504586,
                     "mimeType": "image/png",
                     "nameOnServer": "ut4G1A3Jq9LbfeDxXUh8jibgDB4wPGV1"
                 },
                 "picture": {
                     "originalName": "2014-06-03 17.23.39.jpg",
                     "size": 1504586,
                     "mimeType": "image/png",
                     "nameOnServer": "egStPNb3ysJKhUGtyeFzcwKCPgmp5Cnj"
                 }
             },
             "users": ["56c32acd331dd81f8134f200"]
         }
     }
 }
     */
    router.post('/', tokenChecker, function (request, response) {

        var roomId = "";
        var roomModel = RoomModel.get();

        var form = new formidable.IncomingForm();
        var result = {};

        async.waterfall([

            function (done) {

                form.parse(request, function (err, fields, files) {

                    result.requestParams = { file: files.file, fields: fields };

                    done(err, result);

                });


            },

            function (result, done) {

                roomId = result.requestParams.fields.roomId;

                roomModel.findOne({ _id: roomId }, function (err, roomFindResult) {

                    if (!roomFindResult) {

                        self.successResponse(response, Const.responsecodeUpdateRoomWrongRoomId);

                        return;
                    }

                    result.targetConversation = roomFindResult;

                    done(err, result);

                });

            },

            function (result, done) {

                // validate
                self.validate(result.requestParams.fields, result.requestParams.file, function (err) {

                    if (err) {

                        self.successResponse(response, err);

                    } else {

                        done(err, result);

                    }

                });

            },

            function (result, done) {

                result.targetConversation.update({
                    name: result.requestParams.fields.name

                }, {}, function (err, updateConversationResult) {

                    if (err) {
                        done(err, result);
                        return;
                    }

                    done(err, result);

                });

            },

            function (result, done) {

                if (!result.requestParams.file) {
                    done(null, result);
                    return;
                }

                // save to upload dir
                var tempPath = result.requestParams.file.path;
                var fileName = result.requestParams.file.name;
                var destPath = Config.uploadPath;

                var newFileName = Utils.getRandomString(32);
                result.requestParams.file.newFileName = newFileName;


                fs.copy(tempPath, destPath + "/" + newFileName, function (err) {

                    easyimg.convert({ src: destPath + "/" + newFileName, dst: destPath + "/" + newFileName + ".png", quality: 100 }).then(function (file) {

                        fs.rename(destPath + "/" + newFileName + ".png",
                            destPath + "/" + newFileName, function (err) {

                                done(err, result);

                            });

                    });

                });

            },
            function (result, done) {

                if (!result.requestParams.file) {
                    done(null, result);
                    return;
                }

                var file = result.requestParams.file;

                // generate thumbnail      
                if (file.type.indexOf("jpeg") > -1 ||
                    file.type.indexOf("gif") > -1 ||
                    file.type.indexOf("png") > -1) {

                    var thumbFileName = Utils.getRandomString(32);
                    result.requestParams.file.thumbName = thumbFileName;

                    var destPathTmp = Config.uploadPath + "/" + thumbFileName;

                    easyimg.thumbnail({
                        src: Config.uploadPath + "/" + result.requestParams.file.newFileName,
                        dst: destPathTmp + ".png",
                        width: Const.thumbSize, height: Const.thumbSize
                    }).then(

                        function (image) {

                            fs.rename(destPathTmp + ".png",
                                destPathTmp, function (err) {

                                    done(err, result);

                                });


                        },
                        function (err) {

                            // ignore thubmnail error
                            console.log(err);
                            done(null, result);
                        }

                    );

                } else {

                    done(null, result);

                }

            },

            function (result, done) {

                var updateParams = {
                    modified: Utils.now()
                };

                if (result.requestParams.file) {

                    updateParams.avatar = {
                        picture: {
                            originalName: result.requestParams.file.name,
                            size: result.requestParams.file.size,
                            mimeType: "image/png",
                            nameOnServer: result.requestParams.file.newFileName
                        },
                        thumbnail: {
                            originalName: result.requestParams.file.name,
                            size: result.requestParams.file.size,
                            mimeType: "image/png",
                            nameOnServer: result.requestParams.file.thumbName
                        }
                    };


                }

                if (result.requestParams.fields.description) {

                    updateParams.description = result.requestParams.fields.description;

                }

                result.targetConversation.update(updateParams, {}, function (err, userResult) {

                    if (err) {
                        done(err, result);
                        return;
                    }

                    done(err, result);

                });

            },
            function (result, done) {

                // get latest data
                roomModel.findOne({ _id: roomId }, function (err, roomFindResult) {

                    roomFindResult = roomFindResult.toObject();

                    roomFindResult.ownerModel = request.user.toObject();

                    result.updatedData = roomFindResult;

                    done(err, result);

                });

            },

        ],
            function (err, result) {

                if (err) {

                    self.errorResponse(response, Const.httpCodeServerError);

                } else {

                    self.successResponse(response, Const.responsecodeSucceed, {
                        room: result.updatedData
                    });

                }

            }

        );

    });

    return router;

}

UpdateRoomController.prototype.validate = function (fields, file, callBack) {

    async.waterfall([

        function (done) {

            if (_.isEmpty(fields.name)) {
                done(Const.responsecodeUpdateRoomWrongRoomName, null);
                return;
            }

            if (file) {
                if (file.type.indexOf("jpeg") == -1 &&
                    file.type.indexOf("gif") == -1 &&
                    file.type.indexOf("png") == -1) {

                    done(Const.responsecodeUpdateRoomWrongFile, null);
                    return;
                }
            }


            done(null, null);


        }],

        function (err, result) {

            callBack(err);

        }

    );

}

module["exports"] = new UpdateRoomController();
