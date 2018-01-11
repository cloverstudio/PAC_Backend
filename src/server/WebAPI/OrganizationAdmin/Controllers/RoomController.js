/**  Called for URL /admin/room */

var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');
var JSON = require('JSON2');
var async = require('async');
var validator = require('validator');

var Const = require("../../../lib/consts");
var Config = require("../../../lib/init");
var BackendBaseController = require("./BackendBaseController");
var DatabaseManager = require('../../../lib/DatabaseManager');
var Utils = require('../../../lib/utils');

var SocketAPIHandler = require("../../../SocketAPI/SocketAPIHandler");
var RoomModel = require('../../../Models/Room');
var UserModel = require('../../../Models/User');
var HistoryModel = require('../../../Models/History');

var checkUserAdmin = require('../../../lib/auth.js').checkUserAdmin;

var formidable = require('formidable');
var fs = require('fs');
var easyImg = require('easyimage');

var PermissionLogic = require('../../../Logics/Permission');
var NewUserLogic = require('../../../Logics/NewUser');
var UpdateOrganizationDiskUsageLogic = require("../../../Logics/UpdateOrganizationDiskUsage");

var RoomController = function () {
}

// extends from basecontroller
_.extend(RoomController.prototype, BackendBaseController.prototype);

RoomController.prototype.init = function (app) {

    var self = this;

    router.get('/list', checkUserAdmin, function (request, response) {

        var baseOrganization = request.session.organization;

        var page = request.query.page;
        if (!page)
            page = 1;

        var templateParams = {
            page: "room-list",
            openMenu: "room",
            maxRoomNumber: baseOrganization.maxRoomNumber
        };

        var model = RoomModel.get();
        var baseUser = request.session.user;
        var organizationId = baseUser.organizationId;
        var keyword = request.session.groupKeyword;

        var criteria = {};

        criteria.organizationId = organizationId;

        if (!_.isEmpty(keyword)) {

            criteria.name = new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i")

        }

        async.waterfall([

            function (done) {

                var result = {};

                model.find(criteria).
                    limit(Const.pagingRows).
                    skip((page - 1) * Const.pagingRows).
                    sort({ sortName: "asc" }).
                    exec(function (err, findResult) {

                        result.list = findResult;
                        done(null, result);

                    });

            },
            function (result, done) {

                // get count
                model.count(criteria, function (err, countResult) {

                    result.count = countResult;
                    done(err, result);

                });

            },
            function (result, done) {

                self.numberOfRoomsInOrganization(model, baseUser.organizationId, (err, numberOfRooms) => {

                    result.numberOfRooms = numberOfRooms;
                    done(err, result);

                });

            }
        ],
            function (err, result) {

                if (err)
                    templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
                else
                    templateParams.list = result.list;

                if (request.query.delete) {
                    templateParams.successMessage = self.l10n('The room is successfully deleted.');
                }

                var listCountFrom = (result.count) ? Const.pagingRows * (page - 1) + 1 : result.count;
                var listCountTo = (Const.pagingRows * page > result.count) ? result.count : Const.pagingRows * page;

                templateParams.paging = {

                    page: page,
                    count: result.count,
                    listCountFrom: listCountFrom,
                    listCountTo: listCountTo,
                    rows: Const.pagingRows,
                    baseURL: "/admin/room/list?page="

                }

                templateParams.numberOfRooms = result.numberOfRooms;
                templateParams.keyword = keyword;

                self.render(request, response, '/Room/List', templateParams);

            });

    });

    router.get('/delete/:_id', checkUserAdmin, function (request, response) {

        var _id = request.params._id;

        var templateParams = {
            page: "room-list",
            openMenu: "room"
        };

        if (_.isEmpty(_id)) {

            response.redirect('/admin/room/list');
            return;

        }

        var model = RoomModel.get();

        async.waterfall([

            function (done) {

                var result = {};

                model.findOne({ _id: _id }, function (err, findResult) {

                    if (!findResult) {
                        response.redirect('/admin/room/list');
                        return;
                    }

                    result.obj = findResult;
                    done(err, result)

                });

            }
        ],
            function (err, result) {

                if (err)
                    templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;

                templateParams.formValues = result.obj;

                self.render(request, response, '/Room/Delete', templateParams);

            });

    });


    router.post('/delete/:_id', checkUserAdmin, function (request, response) {

        var _id = request.params._id;

        var baseUser = request.session.user;
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);

        var templateParams = {
            page: "room-list",
            openMenu: "room"
        };

        var model = RoomModel.get();
        var historyModel = HistoryModel.get();

        var uploadPathError = self.checkUploadPath();

        async.waterfall([

            function (done) {

                model.findOne({ _id: _id }, function (err, findResult) {

                    if (!findResult) {
                        response.redirect('/admin/room/list');
                        return;
                    }

                    done(err, { obj: findResult });

                });

            },
            function (result, done) {

                if (uploadPathError) {
                    done(uploadPathError, result);
                    return;
                };

                model.remove({ _id: _id }, function (err, deleteResult) {

                    fs.unlink(Config.uploadPath + "/" + result.obj.avatar.picture.nameOnServer, function () { });
                    fs.unlink(Config.uploadPath + "/" + result.obj.avatar.thumbnail.nameOnServer, function () { });

                    done(err, result);

                });

            },
            function (result, done) {

                // update organization disk usage
                if (result.obj.avatar.picture.size) {

                    var size = -(result.obj.avatar.picture.size + result.obj.avatar.thumbnail.size);

                    UpdateOrganizationDiskUsageLogic.update(baseUser.organizationId, size, (err, updateResult) => {
                        done(err, result);
                    });

                } else {

                    done(null, result);

                }

            },
            function (result, done) {

                // remove history
                historyModel.remove({ chatId: _id }, function (err, deleteResult) {

                    done(err, result);

                });

            }
        ],
            function (err, result) {

                if (err) {

                    templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
                    templateParams.formValues = result.obj;

                    self.render(request, response, '/Room/Delete', templateParams);

                    return;
                }

                response.redirect('/admin/room/list?delete=1');

            });

    });

    router.all('/search', checkUserAdmin, function (request, response) {

        var templateParams = {
            page: "room-list",
            openMenu: "room"
        };

        var keyword = request.body.keyword;

        request.session.groupKeyword = keyword;

        response.redirect('/admin/room/list');

    });


    //******************************************************
    // USER LIST

    router.get('/userlist/:roomId', checkUserAdmin, function (request, response) {

        var roomId = request.params.roomId;
        var baseUser = request.session.user;

        var page = request.query.page;
        if (!page)
            page = 1;

        var templateParams = {
            page: "room-list",
            openMenu: "room",
            roomId: roomId
        };

        var model = RoomModel.get();

        var organizationId = baseUser.organizationId;
        var organizationAdmin = (baseUser.permission == Const.userPermission.organizationAdmin);

        var criteria = {};
        criteria.organizationId = organizationId;
        criteria._id = roomId;

        if (!organizationAdmin) {
            criteria._id = { $ne: baseUser._id };
        }

        async.waterfall([

            function (done) {

                var result = {};

                model.findOne({ _id: roomId }, function (err, findResult) {

                    if (findResult) {
                        templateParams.roomName = findResult.name;
                        result.groupUsers = findResult.users;
                        result.count = findResult.users.length;
                    }

                    done(err, result);

                });

            },
            function (result, done) {

                var model = UserModel.get();

                model.find({ _id: { $in: result.groupUsers } }, (err, users) => {
                    result.list = users;
                    console.log(result.list)
                    done(err, result);
                });

            }

        ],
            function (err, result) {

                if (err)
                    templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
                else
                    templateParams.list = result.list;

                var listCountFrom = (result.count) ? Const.pagingRows * (page - 1) + 1 : result.count;
                var listCountTo = (Const.pagingRows * page > result.count) ? result.count : Const.pagingRows * page;

                templateParams.paging = {

                    page: page,
                    count: result.count,
                    listCountFrom: listCountFrom,
                    listCountTo: listCountTo,
                    rows: Const.pagingRows,
                    baseURL: "/admin/room/userlist/" + roomId + "?page="

                }

                if (request.query.delete) {
                    templateParams.successMessage = self.l10n('The user is successfully deleted.');
                }

                //templateParams.keyword = keyword;

                self.render(request, response, '/Room/UserList', templateParams);

            });

    });



    return router;
}

RoomController.prototype.validation = function (request, response, model, templateParams, isEdit, callback) {

    var errorMessage = "";

    var formValues = templateParams.formValues;
    var file = templateParams.file;

    var baseOrganization = request.session.organization;
    var baseUser = request.session.user;

    var self = this;

    async.waterfall([

        function (done) {

            if (_.isEmpty(formValues.name)) {

                errorMessage = 'Please input name.';

            } else if (file) {

                if (file.type.search("image/") == -1) errorMessage = 'File must be image type.';

            }

            done(errorMessage);

        },
        function (done) {

            var query = {
                name: Utils.getCIString(formValues.name),
                organizationId: request.session.user.organizationId,
                type: Const.groupType.department
            };

            if (isEdit) query._id = { $ne: formValues._id };

            // check duplication
            model.findOne(query, function (err, findResult) {

                if (findResult) errorMessage = 'The department name is taken.';

                done(errorMessage);

            });

        },
        function (done) {

            if (!isEdit) {

                self.numberOfRoomsInOrganization(model, baseUser.organizationId, (err, numberOfGroups) => {

                    if (err) {
                        done(err);
                        return;
                    }

                    if (numberOfGroups >= baseOrganization.maxGroupNumber) {

                        errorMessage = 'You can\'t add more departments to this organization. Maximum number of groups/departments in this organization is ' +
                            baseOrganization.maxGroupNumber + '.';

                    }

                    done(errorMessage);

                });

            } else {

                done(errorMessage);

            }

        }
    ],
        function (err) {

            if (err)
                callback({ clientError: err });
            else
                callback(null);

        });

}

RoomController.prototype.userValidation = function (values, isEdit) {

    var name = values.formValues.name;
    var userid = values.formValues.userid;
    var password = values.formValues.password;

    var file = values.file;

    var errorMessage = "";

    if (!isEdit) {

        if (_.isEmpty(name)) {

            errorMessage = this.l10n('Please input name.');

        } else if (_.isEmpty(userid)) {

            errorMessage = this.l10n('Please input user id.');

        } else if (_.isEmpty(password)) {

            errorMessage = this.l10n('Please input password.');

        } else if (!Const.REUsername.test(userid)) {

            errorMessage = this.l10n('User id must contain only alphabet and number, and more than 6 characters.');

        } else if (!Const.REPassword.test(password)) {

            errorMessage = this.l10n('Password must contain only alphabet and number, and more than 6 characters.');

        }

    } else {


        if (_.isEmpty(name)) {

            errorMessage = this.l10n('Please input name.');

        } else if (_.isEmpty(userid)) {

            errorMessage = this.l10n('Please input user id.');

        } else if (!Const.REUsername.test(userid)) {

            errorMessage = this.l10n('User id must contain only alphabet and number, and more than 6 characters.');

        } else if (!_.isEmpty(password) && !Const.REPassword.test(password)) {

            errorMessage = this.l10n('Password must contain only alphabet and number, and more than 6 characters.');

        }

    }

    if (file && _.isEmpty(errorMessage)) {

        if (file.type.search("image/") == -1) errorMessage = this.l10n('File must be image type.');

    }

    return errorMessage;

}

RoomController.prototype.numberOfRoomsInOrganization = function (roomModel, organizationId, callback) {

    // get count
    roomModel.count({ organizationId: organizationId }, (err, countResult) => {

        callback(err, countResult);

    });

}

module["exports"] = new RoomController();