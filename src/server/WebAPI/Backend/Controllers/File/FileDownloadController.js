/**  Called for /api/v2/test API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');
var formidable = require('formidable');
var fs = require('fs');
var easyImg = require('easyimage');
var path = require('path');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var Config = require(pathTop + "lib/init");
var DatabaseManager = require(pathTop + 'lib/DatabaseManager');
var Utils = require(pathTop + 'lib/utils');
var UserModel = require(pathTop + 'Models/User');
var GroupModel = require(pathTop + 'Models/Group');
var FileModel = require(pathTop + 'Models/File');
var OrganizationModel = require(pathTop + 'Models/Organization');

var BackendBase = require('../BackendBase');

var FileDownloadController = function () {
}

_.extend(FileDownloadController.prototype, BackendBase.prototype);

FileDownloadController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {get} /api/v2/file/fileId download file
      * @apiName File Download
      * @apiGroup WebAPI
      * @apiDescription Returns file binary
      **/

    router.get('/:fileId', function (request, response) {

        var fileId = request.params.fileId;
        var filePath = Config.uploadPath + "/" + fileId;

        var fileModel = FileModel.get();

        async.waterfall([

            (done) => {

                fileModel.findOne({
                    _id: fileId
                }, function (err, findResult) {

                    done(err, {
                        fileModel: findResult
                    })
                });

            },
            (result, done) => {

                fs.exists(filePath, function (exists) {

                    if (!exists) {

                        done("file not found", result);



                    } else {

                        result.filePath = filePath;
                        done(null, result);


                    }

                });

            },

        ], (err, result) => {

            if (err)
                return response.status(404).send('File Not Found');

            response.download(filePath, result.fileModel.name);

        });

    });

    return router;

}

module["exports"] = new FileDownloadController();
