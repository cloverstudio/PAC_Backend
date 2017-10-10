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

        var contacts = request.body.contacts;

        var user = request.user;

        var userContactsModel = UserContactsModel.get();

        async.waterfall([
            saveUserContacts
        ], endAsync);


        /**********************
        ****** FUNCTIONS ******
        **********************/

        function saveUserContacts(done) {

            var result = {};

            userContactsModel.findOne({
                userId: user._id.toString()
            }, (err, findResult) => {

                if (findResult) {

                    var userContacts = findResult.contacts.toObject();

                    userContacts = _.map(userContacts, (userContact) => {

                        var updateContact = _.find(contacts, { id: userContact.id });

                        if (updateContact)
                            userContact.name = updateContact.name;

                        return userContact;

                    });

                    _.forEach(contacts, (contact) => {

                        if (!_.find(userContacts, { id: contact.id }))
                            userContacts.push(contact);

                    });

                    findResult.contacts = userContacts;

                    // update user
                    findResult.save((err, saveResult) => {

                        done(err, result);

                    });

                }
                else {

                    var data = {
                        userId: user._id.toString(),
                        contacts: contacts
                    };

                    // add new user contacts         
                    var userContacts = new userContactsModel(data);
                    userContacts.save((err, saveResult) => {

                        done(err, result);

                    });

                }

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
