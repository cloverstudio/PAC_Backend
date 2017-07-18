/** Called for URL /admin/home */

var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');
var JSON = require('JSON2');
var async = require('async');

var Const = require("../../../lib/consts");
var Config = require("../../../lib/init");
var BackendBaseController = require("./BackendBaseController");
var DatabaseManager = require('../../../lib/DatabaseManager');
var Utils = require('../../../lib/utils');

var checkUserAdmin = require('../../../lib/auth.js').checkUserAdmin;

var APIKeyModel = require('../../../Models/APIKey');

var APIKeyController = function(){
}

// extends from basecontroller
_.extend(APIKeyController.prototype,BackendBaseController.prototype);

APIKeyController.prototype.init = function(app){
    
    var self = this;
	var menuItemName = "api-list";

    router.get('/list', checkUserAdmin, function(request, response) {

        var templateParams = {
            page : menuItemName,
            openMenu : menuItemName
        };

        if (request.query.resultAdd == 'success') {
            templateParams.successMessage = self.l10n('New API Key is generated.');
        }

        if (request.query.resultAdd == 'fail') {
            templateParams.errorMessage = self.l10n('Failed to generate new API key.');
        }

        if (request.query.resultDelete == 'success') {
            templateParams.successMessage = self.l10n('The API Key is deleted.');
        }

        if (request.query.resultDelete == 'fail') {
            templateParams.errorMessage = self.l10n('Failed to delete the API key.');
        }

        if (request.query.resultEnable == 'success') {
            templateParams.successMessage = self.l10n('The API Key is enabled.');
        }

        if (request.query.resultEnable == 'fail') {
            templateParams.errorMessage = self.l10n('Failed to enable the API key.');
        }

        if (request.query.resultDisable == 'success') {
            templateParams.successMessage = self.l10n('The API Key is disabled.');
        }

        if (request.query.resultDisable == 'fail') {
            templateParams.errorMessage = self.l10n('Failed to disable the API key.');
        }

        var model = APIKeyModel.get();

        async.waterfall([(done) => {

            var result = {};

            model.find({
                organizationId:request.session.user.organizationId
            },(err,findResult) => {

                result.list = findResult;
                done(null,result)

            })

        },
        (result,done) => {
            done(null,result)
        }
        ],
        (err,result) => {
            
            templateParams.list = result.list;
            self.render(request, response, '/APIKey/List', templateParams);

        });

    });

    router.post('/add', checkUserAdmin, function(request, response) {

        var model = APIKeyModel.get();

        // generate new API key
        async.waterfall([(done) => {
            
            var result = {};

            var newAPIKey = "";
            var isPassed = false;
            var counter = 0;

            // loop until find free apikey
            async.until(() => {

                return isPassed == true;

            },(doneUntil) =>{

                newAPIKey = Utils.getRandomString(Const.APIKeyLength);

                model.findOne({
                    key: newAPIKey
                },(err,findResult) => {

                    if(!findResult){
                        isPassed = true;
                    }

                    counter++;

                    if(counter > 10){
                        doneUntil("failed");
                        return;
                    }

                    doneUntil(err);

                });

            },(err) => {

                result.validApiKey = newAPIKey;

                done(err,result);

            });

        },
        (result,done) =>{

            // save API key
            var apikey = new model({
                organizationId: request.session.user.organizationId,
                key: result.validApiKey,
                state: 1,
                created: Utils.now()
            });

            // save to DB          
            apikey.save(function(err, saveResult) {

                done(err, result);
            
            });

        }
        ],
        (err,result) => {

            if (err) {
                response.redirect('/admin/apikey/list?resultAdd=fail'); 
            } else {
                response.redirect('/admin/apikey/list?resultAdd=success'); 
            }

        });

    });

    router.get('/delete/:_id', checkUserAdmin, function(request, response) {

        var _id = request.params._id;

        if(_.isEmpty(_id)){
            response.redirect('/admin/apikey/list');  
            return;
        }

        var model = APIKeyModel.get();

        async.waterfall([(done) => {

            var result = {};

            model.remove({ _id: _id }, function(err, deleteResult) {

                done(err, result);

            });

        },
        (result,done) => {
            done(null,result)
        }
        ],
        (err,result) => {
            
            if (err) {
                response.redirect('/admin/apikey/list?resultDelete=fail'); 
            } else {
                response.redirect('/admin/apikey/list?resultDelete=success'); 
            }

        });

        
    });

    router.get('/enable/:_id', checkUserAdmin, function(request, response) {

        var _id = request.params._id;

        if(_.isEmpty(_id)){
            response.redirect('/admin/apikey/list');  
            return;
        }

        var model = APIKeyModel.get();

        async.waterfall([(done) => {

            var result = {};

            model.update({ _id: _id }, { state: 1} , function(err, updateResult) {

                done(err, result);

            });

        },
        (result,done) => {
            done(null,result)
        }
        ],
        (err,result) => {
            
            if (err) {
                response.redirect('/admin/apikey/list?resultEnable=fail'); 
            } else {
                response.redirect('/admin/apikey/list?resultEnable=success'); 
            }

        });

        
    });

    router.get('/disable/:_id', checkUserAdmin, function(request, response) {

        var _id = request.params._id;

        if(_.isEmpty(_id)){
            response.redirect('/admin/apikey/list');  
            return;
        }

        var model = APIKeyModel.get();

        async.waterfall([(done) => {

            var result = {};

            model.update({ _id: _id }, { state: 0} , function(err, deleteResult) {

                done(err, result);

            });

        },
        (result,done) => {
            done(null,result)
        }
        ],
        (err,result) => {
            
            if (err) {
                response.redirect('/admin/apikey/list?resultDisable=fail'); 
            } else {
                response.redirect('/admin/apikey/list?resultDisable=success'); 
            }

        });

        
    });

    return router;
}

module["exports"] = new APIKeyController();