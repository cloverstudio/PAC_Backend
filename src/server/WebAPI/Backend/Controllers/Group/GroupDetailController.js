/** Called for /api/v2/group/detail/:id API  */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var Config = require(pathTop + "lib/init");
var DatabaseManager = require(pathTop + "lib/DatabaseManager");
var Utils = require(pathTop + "lib/utils");
var GroupModel = require(pathTop + "Models/Group");
var UserModel = require(pathTop + "Models/User");
var OrganizationModel = require(pathTop + "Models/Organization");
var tokenChecker = require(pathTop + "lib/authApi");

var BackendBase = require('../BackendBase');

var GroupDetailController = function () {
}

_.extend(GroupDetailController.prototype, BackendBase.prototype);

GroupDetailController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {get} /api/v2/group/detail/:groupId GroupDetail
      * @apiName GroupDetail
      * @apiGroup WebAPI
      * @apiDescription Returns group detail
      * @apiHeader {String} access-token Users unique access-token.
      * @apiSuccessExample Success-Response:
 
 {
     code: 1,
     time: 1457091042485,
     data: {
         group: {
             _id: '56d971e027e87d9634468b13',
             name: 'GROUP 1',
             sortName: 'group 1',
             description: 'GROUP 1 DESCRIPTION',
             created: 1457091040863,
             organizationId: '56d971e027e87d9634468b0e',
             __v: 0,
             users: ['56d971e027e87d9634468b0f',
                 '56d971e027e87d9634468b10',
                 '56d971e027e87d9634468b11',
                 '56d971e027e87d9634468b12'
             ],
             avatar: {
                 thumbnail: {
                     originalName: 'user1.jpg',
                     size: 46100,
                     mimeType: 'jpeg',
                     nameOnServer: 'PWxLHOeV2cNUtrBsCXOE0bRQ4Osz6CTp'
                 },
                 picture: {
                     originalName: 'user1.jpg',
                     size: 36023,
                     mimeType: 'image/jpeg',
                     nameOnServer: 'hncQaxqwl4jAQSBDfNeJtLNxvsyaSI39'
                 }
             },
             userModels: [{
                 _id: '56d971e027e87d9634468b0f',
                 name: 'test',
                 userid: 'userid1Zbpz8',
                 password: '*****',
                 organizationId: '56d971e027e87d9634468b0e',
                 created: 1457091040829,
                 status: 1,
                 __v: 0,
                 tokenGeneratedAt: 1457091041276,
                 token: '*****',
                 description: null,
                 departments: [],
                 groups: [],
                 avatar: {
                     thumbnail: {
                         originalName: 'max.jpg',
                         size: 64914,
                         mimeType: 'image/png',
                         nameOnServer: 'wSstyxEpeSAhJIZPNTXlx2frF41Dk5Er'
                     },
                     picture: {
                         originalName: 'max.jpg',
                         size: 64914,
                         mimeType: 'image/png',
                         nameOnServer: 'ThpaQcWLuaChaYMQbGBUYxtQeE01Lgj3'
                     }
                 }
             }, {
                 _id: '56d971e027e87d9634468b10',
                 name: 'User2',
                 userid: 'userid2zqX36',
                 password: '*****',
                 organizationId: '56d971e027e87d9634468b0e',
                 created: 1457091040840,
                 status: 1,
                 __v: 0,
                 tokenGeneratedAt: 1457091041271,
                 token: '*****',
                 description: null,
                 departments: [],
                 groups: [],
                 avatar: {
                     thumbnail: {
                         originalName: 'user1.jpg',
                         size: 36023,
                         mimeType: 'image/png',
                         nameOnServer: 'BQG4BcxBAqHs3Y9ryx2wixJ1O6tfDgbA'
                     },
                     picture: {
                         originalName: 'user1.jpg',
                         size: 36023,
                         mimeType: 'image/png',
                         nameOnServer: 'RF3JINx0cBEKdkKZuuSIJM9X7VjEXoEV'
                     }
                 }
             }, {
                 _id: '56d971e027e87d9634468b11',
                 name: 'User3',
                 userid: 'userid3D1x0u',
                 password: '*****',
                 organizationId: '56d971e027e87d9634468b0e',
                 created: 1457091040844,
                 status: 1,
                 __v: 0,
                 tokenGeneratedAt: 1457091041272,
                 token: '*****',
                 description: null,
                 departments: [],
                 groups: [],
                 avatar: {
                     thumbnail: {
                         originalName: 'user2.jpg',
                         size: 53586,
                         mimeType: 'image/png',
                         nameOnServer: 'Ih6Nod1NcnTmmkh5gioxeMYGf4VchKbJ'
                     },
                     picture: {
                         originalName: 'user2.jpg',
                         size: 53586,
                         mimeType: 'image/png',
                         nameOnServer: 'N3DLqQEZCko7PDqp4DLpEbyCdLB1Wz3s'
                     }
                 }
             }, {
                 _id: '56d971e027e87d9634468b12',
                 name: 'User4',
                 userid: 'userid43Ow7D',
                 password: '*****',
                 organizationId: '56d971e027e87d9634468b0e',
                 created: 1457091040848,
                 status: 1,
                 __v: 0,
                 tokenGeneratedAt: 1457091041276,
                 token: '*****',
                 description: null,
                 departments: [],
                 groups: [],
                 avatar: {
                     thumbnail: {
                         originalName: 'user3.png',
                         size: 54101,
                         mimeType: 'image/png',
                         nameOnServer: 'p4BSqz4wscdiIA3bk6E5To3i9gui1ufG'
                     },
                     picture: {
                         originalName: 'user3.png',
                         size: 54101,
                         mimeType: 'image/png',
                         nameOnServer: 'jTxTQMgY0DbrIrF88ekrpJa3vlkukCad'
                     }
                 }
             }]
         }
     }
 }
 **/

    router.get('/:groupId', tokenChecker, function (request, response) {

        var userModel = UserModel.get();
        var groupModel = GroupModel.get();

        async.waterfall([

            function (done) {

                var result = {};

                var groupId = request.params.groupId;

                if (!groupId) {
                    self.successResponse(response, Const.responsecodeGroupDetailInvalidGroupId);
                    return;
                }

                groupModel.findOne({ _id: groupId }, function (err, groupFindResult) {

                    if (!groupFindResult) {
                        self.successResponse(response, Const.responsecodeGroupDetailInvalidGroupId);
                        return;
                    }

                    result.group = groupFindResult.toObject();
                    done(err, result);

                });

            },
            function (result, done) {

                var usersLimited = result.group.users;

                if (_.isArray(usersLimited)) {

                    usersLimited = usersLimited.slice(0, 20);

                    usersLimited = usersLimited.map(function (item) {
                        return item.toString();
                    });

                    userModel.find({
                        _id: { $in: usersLimited }
                    }, function (err, userFindResult) {

                        result.group.userModels = userFindResult.map((user) => {
                            return user.toObject();
                        });
                        done(null, result);

                    });

                } else {

                    done(null, result);

                }

            }

        ], function (err, result) {

            if (err) {
                console.log("critical err", err);
                self.errorResponse(response, Const.httpCodeServerError);
                return;
            }

            self.successResponse(response, Const.responsecodeSucceed, result);

        });

    });

    return router;

}

module["exports"] = new GroupDetailController();
