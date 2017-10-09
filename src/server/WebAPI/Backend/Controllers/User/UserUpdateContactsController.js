/** Called for /api/v2/user/sync API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var UserContactsModel = require(pathTop + 'Models/UserContacts');

var tokenChecker = require(pathTop + 'lib/authApi');

var BackendBase = require('../BackendBase');

var UserUpdateContactsController = function () {
}

_.extend(UserUpdateContactsController.prototype, BackendBase.prototype);

UserUpdateContactsController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {post} /api/v2/user/updateContacts User Update Contacts
      * @apiName User Update Contacts
      * @apiGroup WebAPI
      * @apiDescription User Update Contacts
      
      * @apiHeader {String} access-token Users unique access-token.

      * @apiParam {String} organization organization name
      * @apiParam {String} phoneNumbers should receive with all numbers like this: "+385987654324,+385998765456,+385916342536"
      * 
      * @apiSuccessExample Success-Response:
        {
            "code": 1,
            "time": 1507293117920,
            "data": {}
        }
 
     */

    router.post('/', tokenChecker, (request, response) => {

        var contacts = request.body.contacts;

        var user = request.user;

        async.waterfall([
            saveUserContacts
        ], endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function saveUserContacts(done) {


            done(null, {});


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
