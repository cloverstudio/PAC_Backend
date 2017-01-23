/**  Called for URL /admin/ */

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
var OrganizationModel = require('../../../Models/Organization');
var UserModel = require('../../../Models/User');


var PermissionLogic = require('../../../Logics/Permission');
var async = require('async');

var SignInController = function() {
}

// extends from basecontroller
_.extend(SignInController.prototype, BackendBaseController.prototype);

SignInController.prototype.init = function(app) {
    
    var self = this;

    router.get('/', function(request, response) {
        
        var templateParams = {
            organizationId: request.query.organizationId,
            username: request.query.username
        };

        // is user is already logged in with query organizationId and username, skip login page
        if (request.session.user) {
            if (request.session.user.userid == templateParams.username && request.session.organization.organizationId == templateParams.organizationId) {
                response.redirect('/admin/home');
                return;
            };
        };

        self.renderLogin(request, response, '/Login/Signin', templateParams);
        
    });

    router.post('/', function(request, response) {

        var organizationId = request.body.organizationId;
        var username = request.body.username;
        var password = request.body.password;
        var signup = request.body.signup;

        var model = UserModel.get();
        var organizationModel = OrganizationModel.get();
        
        async.waterfall([

            function(done) {

                organizationModel.findOne({ 
                    organizationId: organizationId,
                    status: 1
                }, function(err, findResult) {
                    
                    if (findResult) {

                        done(err, { organization: findResult });   

                    } else {

                        var errMsg = "";

                        if (signup) 
                            errMsg = "Invalid organization ID for sign up!";
                        else
                            errMsg = "Invalid organization ID!";

                        done(self.l10n(errMsg));  
                         
                    }
               
                });

            },
            function(result, done) {

                if (!signup) {

                    model.findOne({
                        userid: username, 
                        password: Utils.getHash(password),
                        status: 1,
                        permission: { $ne: Const.userPermission.webClient },
                        organizationId: result.organization._id
                    }, function(err, findResult) {
                        
                        if (findResult) {

                            result.user = findResult.toObject();
                            done(err, result);

                        } else {

                            done(self.l10n("Invalid username or password!"));  
                             
                        }
                   
                    });

                } else {

                    done(null, result);

                };

            },
            function(result, done) {

                if (!signup) {

                    // get departments
                    PermissionLogic.getDepartments(result.user._id.toString(), function(departments) {
                        
                        result.user.defaultDepartments = _.intersection(result.user.groups, departments);
                        result.user.groups = _.union(result.user.groups, departments);
                        done(null, result);
                        
                    });

                } else {

                    done(null, result);

                }

            }
        ],
        function (err, result) {

            if (err) {

                self.renderLogin(request, response, '/Login/Signin', {
                    errorMessage: err, 
                    organizationId: organizationId,
                    username: username
                });

                return;
            }

            if (!signup) {

                request.session.user = result.user;
                request.session.organization = result.organization;

                var originalUrl = "/admin/home";
                if (request.query.originalUrl) originalUrl = request.query.originalUrl;
            
                response.redirect(originalUrl);

            } else {

                response.redirect("/signup/" + organizationId);

            };

        });

    });
    
    return router;
}

module["exports"] = new SignInController();