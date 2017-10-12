/** Called for /api/v2/user/sync API */
'use strict';

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var UserContactsModel = require(pathTop + 'Models/UserContacts');
var UserModel = require(pathTop + 'Models/User');

var tokenChecker = require(pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var UserUpdateContactsController = function () {
}

_.extend(UserUpdateContactsController.prototype, BackendBase.prototype);

UserUpdateContactsController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {get} /api/v2/user/getContacts User Get Contacts
      * @apiName User Get Contacts
      * @apiGroup WebAPI
      * @apiDescription User Get Contacts
      
      * @apiHeader {String} access-token Users unique access-token.

      * @apiSuccessExample Success-Response:
        {
            "code": 1,
            "time": 1507293117920,
            "data": {
                "users": [
                    {
                        "_id": "59df1bde5f62d1632b3ba381",
                        "created": 1507793886231,
                        "phoneNumber": "+385989057351",
                        "userid": "+385989057351",
                        "name": "Jura",
                        "description": "jura opis",
                        "avatar": {
                            "thumbnail": {
                                "originalName": "images.jpg",
                                "size": 7897,
                                "mimeType": "jpeg",
                                "nameOnServer": "pYasg5hAJG1YFmPRFQjFMZ2XeBR021EY"
                            },
                            "picture": {
                                "originalName": "images.jpg",
                                "size": 3269,
                                "mimeType": "image/jpeg",
                                "nameOnServer": "WKYwoIcIG4PVykzFudK4Z1jjQQGzyYpp"
                            }
                        },
                        "userContactName": "jura mobile"
                    }
                ]
            }
        }
 
     */

    router.get('/', tokenChecker, (request, response) => {

        var user = request.user;

        var userContactsModel = UserContactsModel.get();
        var userModel = UserModel.get();

        async.waterfall([
            getUserContacts,
            getUsersByContacts,
            parseUsers
        ], endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function getUserContacts(done) {

            var result = {};

            userContactsModel.find({ userId: user._id.toString() }, (err, findResult) => {

                result.userContacts = findResult;
                done(err, result);

            });

        };

        function getUsersByContacts(result, done) {

            var userContactsIds = _.map(result.userContacts, "contactId");

            userModel.find(
                {
                    _id: { $in: userContactsIds }
                },
                {
                    userid: true,
                    phoneNumber: true,
                    name: true,
                    description: true,
                    avatar: true,
                    created: true
                },
                (err, findResult) => {

                    result.users = findResult;
                    done(err, result);

                });

        };

        function parseUsers(result, done) {

            result.users = _.map(result.users, (user) => {
                user = user.toObject();

                user.userContactName = _.find(result.userContacts, { contactId: user._id.toString() }).name;

                return user;
            });

            done(null, result);

        };

        function endAsync(err, result) {

            if (err) {
                if (err.handledError) {
                    self.successResponse(response, err.handledError);
                }
                else {
                    console.log(err);
                    self.successResponse(response, Const.responsecodeUnknownError);
                }
            }
            else {
                self.successResponse(response, Const.responsecodeSucceed, {
                    users: result.users
                });
            }

        };

    });

    return router;

}

module["exports"] = new UserUpdateContactsController();
