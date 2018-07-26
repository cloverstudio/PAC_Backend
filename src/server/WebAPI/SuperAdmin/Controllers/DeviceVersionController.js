/** Called for URL /admin/home */

var express = require('express');
var router = express.Router();

var _ = require('lodash');

var async = require('async');

var BackendBaseController = require("./BackendBaseController");

var checkUserOwner = require('../../../lib/auth.js').checkUserOwner;

var DeviceVersionModel = require('../../../Models/DeviceVersion');

var DeviceVersionController = function () {
}

// extends from basecontroller
_.extend(DeviceVersionController.prototype, BackendBaseController.prototype);

DeviceVersionController.prototype.init = function (app) {

    var self = this;
    var menuItemName = "deviceVersion";

    router.get('/', checkUserOwner, function (request, response) {

        var templateParams = {
            page: menuItemName
        };

        var deviceVersionModel = DeviceVersionModel.get();

        async.waterfall([

            function (done) {

                var result = {};

                deviceVersionModel.findOne((err, findResult) => {

                    result.deviceVerson = findResult;
                    done(err, result);

                });

            }

        ], function (err, result) {

            templateParams.formValues = result.deviceVerson;

            if (err) {
                console.log("load device version err:", err);
                templateParams.errorMessage = self.l10n('Error happens while loading device versions.');
            }

            self.render(request, response, '/DeviceVersion/DeviceVersion', templateParams);

        });

    });

    router.post('/', checkUserOwner, function (request, response) {

        var templateParams = {
            page: menuItemName
        };

        var deviceVersionModel = DeviceVersionModel.get();

        var formValues = request.body;

        async.waterfall([

            function (done) {

                var result = {};

                deviceVersionModel.findOne((err, findResult) => {

                    result.deviceVerson = findResult;
                    done(err, result);

                });

            },
            function (result, done) {

                var params = {
                    iosBuildVersion: formValues.iosBuildVersion,
                    androidBuildVersion: formValues.androidBuildVersion
                };

                if (!result.deviceVerson) {

                    var model = new deviceVersionModel(params);

                    model.save((err, saveResult) => {
                        done(err, result);
                    });

                }
                else {

                    deviceVersionModel.update({}, params, (err, updateResult) => {
                        done(err, result);
                    });

                }

            }

        ], function (err, result) {

            templateParams.formValues = formValues;

            if (err) {
                console.log("save device version err:", err);
                templateParams.errorMessage = self.l10n('Error happens while saving device versions.');
            }
            else
                templateParams.successMessage = self.l10n('Device versions are saved.');

            self.render(request, response, '/DeviceVersion/DeviceVersion', templateParams);

        });


    });

    return router;
}

module["exports"] = new DeviceVersionController();