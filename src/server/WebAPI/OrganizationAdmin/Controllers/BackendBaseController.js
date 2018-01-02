/** Base Controller for admin CMS */

var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');
var JSON = require('JSON2');
var async = require('async');

var Const = require("../../../lib/consts");
var Config = require("../../../lib/init");
var DatabaseManager = require('../../../lib/DatabaseManager');
var BaseController = require("../../BaseController");

var UserModel = require('../../../Models/User');
var GroupModel = require('../../../Models/Group');

var BackendBaseController = function () {

}

_.extend(BackendBaseController.prototype, BaseController.prototype);
BackendBaseController.prototype.loginUser = null;

BackendBaseController.prototype.ViewTop = "OrganizationAdmin/Views";

BackendBaseController.prototype.renderLogin = function (request, response, template, params) {

    var lang = request.cookies.lang;
    if (!lang)
        lang = 'en';

    var defaultParameters = {
        lang: lang,
        Config: Config,
        AssetURL: "/assets/admin",
        layout: this.ViewTop + "/Login/SigninLayout"
    };

    var templateParams = _.assign(defaultParameters, params);

    response.render(this.ViewTop + template, templateParams);

}

BackendBaseController.prototype.render = function (request, response, template, params) {

    var lang = request.cookies.lang;
    if (!lang)
        lang = 'en';

    let avatarFileId = "";
    if (request.session.user.avatar && request.session.user.avatar.thumbnail)
        avatarFileId = request.session.user.avatar.thumbnail.nameOnServer

    var defaultParameters = {
        lang: lang,
        Config: Config,
        AssetURL: "/assets/admin2",
        layout: this.ViewTop + "/DefaultLayout",
        signInUserName: request.session.user.name,
        signInOrganization: request.session.organization.name,
        avatarFileId: avatarFileId
    };

    var templateParams = _.assign(defaultParameters, params);

    response.render(this.ViewTop + template, templateParams);

}

BackendBaseController.prototype.getGroups = function (baseUser, groupModel, groupType, callback) {

    var model = groupModel.get();

    var query = {
        organizationId: baseUser.organizationId,
        type: groupType
    };

    if (baseUser.permission != Const.userPermission.organizationAdmin) {

        query._id = { $in: baseUser.groups };

    };

    model.find(query, { name: true, parentId: true }).sort({ sortName: "asc" }).batchSize(Const.maxBatchSizeFindResult).exec(function (err, findResult) {

        callback(err, findResult);

    });

}

BackendBaseController.prototype.addUserToGroup = function (groupId, userId, callback) {

    var userModel = UserModel.get();
    var groupModel = GroupModel.get();

    async.waterfall([

        (done) => {

            userModel.findOne({ _id: userId }, { groups: 1 }, (err, findResult) => {

                if (err) {
                    done(err);
                    return;
                }

                var groups = [];
                groups.push(findResult.groups, groupId);

                findResult.groups = _.flattenDeep(groups);

                findResult.save((err, saveResult) => {

                    done(err);

                });

            });

        },
        (done) => {

            groupModel.findOne({ _id: groupId }, { users: 1 }, (err, findResult) => {

                if (err) {
                    done(err);
                    return;
                }

                var users = [];
                users.push(findResult.users, userId);

                findResult.users = _.flattenDeep(users);

                findResult.save((err, saveResult) => {

                    done(err);

                });

            });

        }
    ],
        (err) => {

            callback(err);

        });

}

module["exports"] = BackendBaseController;