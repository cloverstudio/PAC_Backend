/** Called for /api/v2/user/sync API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var UserModel = require(pathTop + 'Models/User');

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
      * @apiParam {String} organizationId _id of organization 
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

        var organizationId = request.body.organizationId;
        var arrPhoneNumbers = _.map(request.body.phoneNumbers.split(","), _.trim);

        var userModel = UserModel.get();

        async.waterfall([
            getUsersByPhoneNumber
        ], endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function getUsersByPhoneNumber(done) {

            userModel.find(
                {
                    userid: { $in: arrPhoneNumbers },
                    status: Const.userStatus.enabled,
                    organizationId: organizationId
                },
                {
                    userid: true,
                    phoneNumber: true,
                    name: true,
                    description: true,
                    avatar: true
                },
                (err, findResult) => {

                    done(err, { users: findResult });

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
                self.successResponse(response, Const.responsecodeSucceed, result);
            }

        };

    });

    return router;

}

module["exports"] = new UserSyncContactsController();
