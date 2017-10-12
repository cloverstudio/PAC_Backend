/** Called for /api/v2/user/sync API */
'use strict';

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

      * @apiParam {Object[]} contacts object array of contacts
      * @apiParam {String} contacts.id
      * @apiParam {String} contacts.name
      * 
      * @apiSuccessExample Success-Response:
        {
            "code": 1,
            "time": 1507293117920,
            "data": {}
        }
 
     */

    router.post('/', tokenChecker, (request, response) => {

        var user = request.user;

        var contacts = _.map(request.body.contacts, (contact) => {
            contact.userId = user._id.toString();
            contact.contactId = contact.id;
            delete contact.id;

            return contact;
        });

        var userContactsModel = UserContactsModel.get();

        async.waterfall([
            deleteContacts,
            saveContacts
        ], endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function deleteContacts(done) {

            var result = {};

            var contactsIds = _.map(contacts, "contactId");

            userContactsModel.remove({
                userId: user._id.toString(),
                contactId: { $in: contactsIds }
            }, (err, deleteResult) => {

                done(err, result);

            });

        };

        function saveContacts(result, done) {
            
            userContactsModel.create(contacts, (err, insertResult) => {

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
                self.successResponse(response, Const.responsecodeSucceed);
            }

        };

    });

    return router;

}

module["exports"] = new UserUpdateContactsController();
