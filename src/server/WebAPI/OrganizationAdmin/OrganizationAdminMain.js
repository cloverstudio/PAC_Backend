/** Initialize organization admin part */

var express = require('express');
var router = express.Router();
var fs = require('fs')

var bodyParser = require("body-parser");
var _ = require('lodash');

var init = require('../../lib/init.js');

var OrganizationAdminMain = {

    init: function (app) {

        var self = this;

        router.use("/signin", require("./Controllers/SigninController").init(app));
        router.use("/home", require("./Controllers/HomeController").init(app));
        router.use("/user", require("./Controllers/UserController").init(app));
        router.use("/group", require("./Controllers/GroupController").init(app));
        router.use("/signout", require("./Controllers/SignoutController").init(app));
        router.use("/department", require("./Controllers/DepartmentController").init(app));
        router.use("/sticker", require("./Controllers/StickerController").init(app));
        router.use("/settings", require("./Controllers/SettingsController").init(app));
        router.use("/apikey", require("./Controllers/APIKeyController").init(app));
        router.use("/webhook", require("./Controllers/WebhookController").init(app));
        router.use("/conversation", require("./Controllers/ConversationController").init(app));

        router.get('/file', function (request, response) {

            var filePath = init.publicPath + "/assets/admin/images/nogroup.png";
            response.sendFile(filePath);

        });

        router.get('/file/:fileID', function (request, response) {

            var fileID = request.params.fileID;
            var filePath = init.uploadPath + "/" + fileID;

            fs.exists(filePath, function (exists) {

                if (!exists) {

                    filePath = init.publicPath + "/assets/admin/images/nogroup.png";
                    response.sendFile(filePath);

                } else {

                    response.sendFile(filePath);

                }

            });


        });

        return router;

    }

}

module["exports"] = OrganizationAdminMain;
