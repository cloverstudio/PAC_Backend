/** Called for /api/v2/user/sync API */
'use strict';

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var UserModel = require(pathTop + 'Models/User');
var OrganizationModel = require(pathTop + 'Models/Organization');

var BackendBase = require('../BackendBase');

var UserSyncContactsController = function () {
}

_.extend(UserSyncContactsController.prototype, BackendBase.prototype);

UserSyncContactsController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {post} /api/v2/user/sync User Sync Contacts
      * @apiName User Sync Contacts
      * @apiGroup WebAPI
      * @apiDescription User Sync Contacts
      *   
      * @apiParam {String} organization organization name
      * @apiParam {String} phoneNumbers should receive with all numbers like this: "+385987654324,+385998765456,+385916342536"
      * 
      * @apiSuccessExample Success-Response:
        {
            "code": 1,
            "time": 1507293117920,
            "data": {
                "users": [
                    {
                        "_id": "59d5f9dfc4282cb82e229519",
                        "phoneNumber": "+385976376676",
                        "userid": "+385976376676",
                        "name": "ivo2345",
                        "description": ""
                    },
                    {
                        "_id": "59d607f4ad8f7e8b23c10af2",
                        "phoneNumber": "+385989057351",
                        "userid": "+385989057351",
                        "name": "Jura",
                        "description": "debeli jura",
                        "avatar": {
                            "thumbnail": {
                                "originalName": "images.jpg",
                                "size": 7897,
                                "mimeType": "jpeg",
                                "nameOnServer": "udbipys2F14jrRC5a1L19HSGKL8MpIaC"
                            },
                            "picture": {
                                "originalName": "images.jpg",
                                "size": 3269,
                                "mimeType": "image/jpeg",
                                "nameOnServer": "bq1EeoYyK5yOsVRqSywPXk80nYdv8jK3"
                            }
                        }
                    }
                ]
            }
        }
 
     */

    router.post('/', (request, response) => {

        var organization = request.body.organization;
        var phoneNumbers = request.body.phoneNumbers || "";
        
        var arrPhoneNumbers = _.map(phoneNumbers.split(","), _.trim);

        var userModel = UserModel.get();
        var organizationModel = OrganizationModel.get();

        async.waterfall([
            validate,
            getUsersByPhoneNumber
        ], endAsync);

        console.log("\n--------organization------------\n", organization);
        console.log("\n---------phoneNumbers--------------\n", phoneNumbers);
        
        /**********************
        ****** FUNCTIONS ******
        **********************/

        function validate(done) {

            if (_.isEmpty(organization))
                return done({ handledError: Const.responsecodeNoOrganizationName });

            // get organization 
            organizationModel.findOne({ organizationId: organization }, (err, findResult) => {

                if (_.isEmpty(findResult))
                    return done({ handledError: Const.responsecodeWrongOrganizationName });

                done(err, { organization: findResult.toObject() });

            });

        };

        function getUsersByPhoneNumber(result, done) {

            console.log("\n-------phoneNumbersarray---------\n", arrPhoneNumbers);
            console.log("\n--------organizationId-----------\n", result.organization._id.toString());

            userModel.find(
                {
                    userid: { $in: arrPhoneNumbers },
                    status: Const.userStatus.enabled,
                    organizationId: result.organization._id.toString(),
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
                    console.log("\n----------users before------------\n", findResult);
                    
                    result.users = findResult.map((user) => {
                        return user.toObject();
                    });
                    console.log("\n------------users------------\n", result.users);
                    done(err, result);

                });

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

module["exports"] = new UserSyncContactsController();
