/** Called for URL /admin/home */

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

var checkUserAdmin = require('../../../lib/auth.js').checkUserAdmin;

var WebhookModel = require('../../../Models/Webhook');

var WebhookController = function(){
}

// extends from basecontroller
_.extend(WebhookController.prototype,BackendBaseController.prototype);

WebhookController.prototype.init = function(app){
    
    var self = this;
	var menuItemName = "webhook-list";

    router.get('/list', checkUserAdmin, function(request, response) {

        var templateParams = {
            page : menuItemName,
            openMenu : menuItemName
        };

        if (request.query.resultAdd == 'success') {
            templateParams.successMessage = self.l10n('Webhook is generated.');
        }

        if (request.query.resultAdd == 'fail') {
            templateParams.errorMessage = self.l10n('Failed to generate new Webhook.');
        }

        if (request.query.resultDelete == 'success') {
            templateParams.successMessage = self.l10n('The webhook is deleted.');
        }

        if (request.query.resultDelete == 'fail') {
            templateParams.errorMessage = self.l10n('Failed to delete the webhook.');
        }

        if (request.query.resultEnable == 'success') {
            templateParams.successMessage = self.l10n('The webhook is enabled.');
        }

        if (request.query.resultEnable == 'fail') {
            templateParams.errorMessage = self.l10n('Failed to enable the webhook.');
        }

        if (request.query.resultDisable == 'success') {
            templateParams.successMessage = self.l10n('The webhook is disabled.');
        }

        if (request.query.resultDisable == 'fail') {
            templateParams.errorMessage = self.l10n('Failed to disable the webhook.');
        }

        var model = WebhookModel.get();

        async.waterfall([(done) => {

            var result = {};

            model.find({
                organizationId:request.session.user.organizationId
            },(err,findResult) => {
                result.list = findResult;
                done(null,result)
            });

        },
        (result,done) => {
            done(null,result)
        }
        ],
        (err,result) => {
            
            templateParams.list = result.list;
            self.render(request, response, '/Webhook/List', templateParams);

        });

    });

    router.get('/add', checkUserAdmin, function(request, response) {

        var baseUser = request.session.user;

        var templateParams = {
        };
        
        async.waterfall([
            
            function(done) {
                
                let result = {};

                const newKey = Utils.getRandomString(Const.APIKeyLength);
                result.key = newKey;

                done(null, result);

            }
            
        ],
        function(err, result) {

            if(err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
        
            templateParams.formValues = result;

            self.render(request, response, '/Webhook/Add', templateParams);

        });

    }); 

    router.post('/add', checkUserAdmin, function(request, response) {

        var model = WebhookModel.get();

        // validation
        var webhookURL = request.body.url;
        var key = request.body.key;
        if(!validator.isURL(webhookURL)){
            var templateParams = {};
            templateParams.errorMessage = self.l10n('Please input valid url');
            return self.render(request, response, '/Webhook/Add', templateParams);
        }
        
        // generate new API key
        async.waterfall([(done) => {
            
            var result = {};
            done(null,result);

        },
        (result,done) =>{

            // save API key
            var webhook = new model({
                organizationId: request.session.user.organizationId,
                key: key,
                url: webhookURL,
                state: 1,
                created: Utils.now()
            });

            // save to DB          
            webhook.save(function(err, saveResult) {

                done(err, result);
            
            });

        }],
        (err,result) => {

            if (err) {
                response.redirect('/admin/webhook/list?resultAdd=fail'); 
            } else {
                response.redirect('/admin/webhook/list?resultAdd=success'); 
            }

        });

    });

    router.get('/delete/:_id', checkUserAdmin, function(request, response) {

        var _id = request.params._id;

        if(_.isEmpty(_id)){
            response.redirect('/admin/webhook/list');  
            return;
        }

        var model = WebhookModel.get();

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
                response.redirect('/admin/webhook/list?resultDelete=fail'); 
            } else {
                response.redirect('/admin/webhook/list?resultDelete=success'); 
            }

        });

        
    });

    router.get('/enable/:_id', checkUserAdmin, function(request, response) {

        var _id = request.params._id;

        if(_.isEmpty(_id)){
            response.redirect('/admin/webhook/list');  
            return;
        }

        var model = WebhookModel.get();

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
                response.redirect('/admin/webhook/list?resultEnable=fail'); 
            } else {
                response.redirect('/admin/webhook/list?resultEnable=success'); 
            }

        });

        
    });

    router.get('/disable/:_id', checkUserAdmin, function(request, response) {

        var _id = request.params._id;

        if(_.isEmpty(_id)){
            response.redirect('/admin/webhook/list');  
            return;
        }

        var model = WebhookModel.get();

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
                response.redirect('/admin/webhook/list?resultDisable=fail'); 
            } else {
                response.redirect('/admin/webhook/list?resultDisable=success'); 
            }

        });

        
    });

    return router;
}

module["exports"] = new WebhookController();