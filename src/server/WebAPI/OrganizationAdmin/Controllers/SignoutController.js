/** Called for URL /admin/signout */

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

var SignoutController = function(){
}

// extends from basecontroller
_.extend(SignoutController.prototype,BackendBaseController.prototype);

SignoutController.prototype.init = function(app){
    
    var self = this;

    router.get('/', function(request, response) {

        request.session.destroy();
        response.redirect('/admin/signin');	
        
    });
    
    return router;
    
}

module["exports"] = new SignoutController();