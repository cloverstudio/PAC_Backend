/**  Called for URL /404 */

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

var OrganizationModel = require('../../../Models/Organization');
var UserModel = require('../../../Models/User');

var NewOrganizationLogic = require('../../../Logics/NewOrganization');
var NewUserLogic = require('../../../Logics/NewUser');

var NotFoundController = function(){
}

// extends from basecontroller
_.extend(NotFoundController.prototype,BackendBaseController.prototype);

NotFoundController.prototype.init = function(app){
    
    var self = this;

    router.get('/', function(request, response) {

        response.status(404);
        self.renderSignup(request, response, '/NotFound/NotFound', { });

    });

    return router;
}

module["exports"] = new NotFoundController();