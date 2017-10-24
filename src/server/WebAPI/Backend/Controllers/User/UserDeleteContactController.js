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

var UserDeleteContactController = function () {
}

_.extend(UserDeleteContactController.prototype, BackendBase.prototype);

UserDeleteContactController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {get} /api/v2/user/deleteContact/:contactId User Delete Contact
      * @apiName User Delete Contact
      * @apiGroup WebAPI
      * @apiDescription User Delete Contact
      
      * @apiHeader {String} access-token Users unique access-token.

      * @apiSuccessExample Success-Response:
        {
            "code": 1,
            "time": 1507293117920,
            "data": {}
        }
 
     */

    router.get('/:contactId', tokenChecker, (request, response) => {

        var user = request.user;
        var contactId = request.params.contactId;

        var userContactsModel = UserContactsModel.get();

        async.waterfall([
            deleteContact,
        ], endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function deleteContact(done) {

            userContactsModel.remove({
                userId: user._id.toString(),
                contactId: contactId
            }, (err, deleteResult) => {

                if (deleteResult.result.n == 0)
                    return done({ handledError: Const.responsecodeWrongUserContactId });
                    
                done(err, {});

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
                self.successResponse(response, Const.responsecodeSucceed);
            }

        };

    });

    return router;

}

module["exports"] = new UserDeleteContactController();
