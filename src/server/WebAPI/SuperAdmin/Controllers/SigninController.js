/** Called for URL /owner */

var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');
var JSON = require('JSON2');

var Const = require("../../../lib/consts");
var Config = require("../../../lib/init");
var BackendBaseController = require("./BackendBaseController");
var DatabaseManager = require('../../../lib/DatabaseManager');
var Utils = require('../../../lib/utils');

var SignInController = function(){
}

// extends from basecontroller
_.extend(SignInController.prototype,BackendBaseController.prototype);

SignInController.prototype.init = function(app){
    
    var self = this;

    router.get('/',function(request, response) {

        self.renderLogin(request, response, '/Login/Signin', {});

    });

    router.post('/',function(request, response) {
        var username = request.body.username;
        var password = request.body.password;

        if (username == Config.username && password == Config.password) {

        	request.session.superAdmin = username;

            var originalUrl = "/owner/home";
            if (request.query.originalUrl) originalUrl = request.query.originalUrl;
        
            response.redirect(originalUrl);
            
        } else {
        	self.renderLogin(request, response, '/Login/Signin', {
                errorMessage: self.l10n("Invalid username or password!"), 
                username: username
            });
        }
    });
    
    return router;
    
}

module["exports"] = new SignInController();