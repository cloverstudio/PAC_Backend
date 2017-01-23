/** Called for URL /signup and /signup/"organization name"  */

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

var SignupController = function(){
}

// extends from basecontroller
_.extend(SignupController.prototype,BackendBaseController.prototype);

SignupController.prototype.init = function(app) {
    
    var self = this;

    router.get('/', function(request, response) {

        self.renderSignup(request, response, '/Signup/AdminSignup', { focusField: "organizationId" });

    });

    router.post('/', function(request, response) {

        var formValues = request.body;

        var signupUserURL = Config.protocol + request.headers.host + "/signup/" + formValues.organizationId;
        var adminURL = Config.protocol + request.headers.host + 
            "/admin/signin?organizationId=" + formValues.organizationId + 
            "&username=" + formValues.username;
        var webClientURL = Config.protocol + request.headers.host;

        async.waterfall([

            function(done) {

                self.validation(request, response, true, function(err) {
                    done(err, {});
                });

            },
            function(result, done) {

                if (!_.isEmpty(formValues.email)) {

                    var newLine = "<br/>";            

                    var body = self.l10n("Regards,") + newLine + newLine + 
                        self.l10n("Thank you for your registration on Spika For Business.") + newLine + newLine + newLine + 
                        self.l10n("Your account details:") + newLine + newLine + 
                        self.l10n("Organization: ") + formValues.organizationId + newLine + 
                        self.l10n("Username: ") + formValues.username + newLine + 
                        self.l10n("Password: ") + formValues.password[1] + newLine + newLine + 
                        self.l10n("Admin login: ") + "<a href='" + adminURL + "'>" + adminURL + "</a>" + newLine +
                        self.l10n("Web Client login: ") + "<a href='" + webClientURL + "'>" + webClientURL + "</a>" + newLine + newLine + 
                        self.l10n("Signup user: ") + "<a href='" + signupUserURL + "'>" + signupUserURL + "</a>" + newLine + newLine + newLine + newLine +
                        self.l10n("Please keep this email for future reference.") + newLine + newLine + 
                        self.l10n("Best regards,") + newLine + 
                        self.l10n("Spika team");

                    Utils.sendEmail(formValues.email, self.l10n("Spika for business signup"), body, true, (err, info) => {
                        
                        done(err, result);
                    
                    });        

                } else {

                    done(null, result);

                }         

            },
            function(result, done) {

                NewOrganizationLogic.create(
                    formValues.organizationId, 
                    formValues.username, 
                    formValues.password[1], 
                    null,
                    null, 
                    null, 
                    formValues.email, 
                    null, 
                    null, 
                    null, 
                    null, 
                    null, 
                    null,
                function(err, saveResult) {

                    done(err, result);
                    
                });

            }
        ],
        function (err, result) {

            if (err) {

                self.renderSignup(request, response, '/Signup/AdminSignup', {
                    errorMessage: (err.errorMessage) ? self.l10n(err.errorMessage) : self.l10n(err), 
                    focusField: err.focusField, 
                    email: formValues.email,
                    organizationId: formValues.organizationId,
                    username: formValues.username,
                    password: formValues.password[1],
                    reenterPassword: formValues.reenterPassword
                });

                return;
            }

            self.renderSignup(request, response, '/Signup/AdminSignupFinish', { 
                copyURL: signupUserURL,
                adminURL: "/admin/signin?organizationId=" + formValues.organizationId + "&username=" + formValues.username
            });

        });

    });

    // router.get('/finish', function(request, response) {
        
    //     self.renderSignup(request, response, '/Signup/AdminSignupFinish', { 
    //         copyURL: Config.protocol + request.headers.host + "/signup/jurica",
    //         adminURL: "/admin/signin?organizationId=jurica&username=orgadmin"
    //     });

    // });
    
    // router.get('/finishuser', function(request, response) {

    //     self.renderSignup(request, response, '/Signup/UserSignupFinish');

    // });

    router.get('/:organizationId', function(request, response) {

        var organizationId = request.params.organizationId;
        
        var organizationModel = OrganizationModel.get();
    
        organizationModel.findOne({ organizationId: organizationId }, { name: true }, function(err, findResult) {

            if (findResult) {

                self.renderSignup(request, response, '/Signup/UserSignup', { focusField: "username", organizationName: findResult.name });                                                
            
            } else {
                
                response.status(404);
                self.renderSignup(request, response, '/NotFound/NotFound', {});                                                
            
            }

        });

    });

    router.post('/:organizationId', function(request, response) {

        var organizationId = request.params.organizationId;
        var formValues = request.body;

        var userModel = UserModel.get();
        var organizationModel = OrganizationModel.get();
        
        async.waterfall([

            function(done) {

                var result = {};

                // get organization by organizationId
                organizationModel.findOne({ status: 1, organizationId: organizationId }, function(err, findResult) {

                    if (err) {
                        done(err, result);
                        return;
                    }

                    if (findResult) {

                        result.organization = findResult;
                        done(null, result);
                                        
                    } else {

                        done("Organization does not exist.", result);

                    }
               
                });

            },
            function(result, done) {

                self.validation(request, response, false, function(err) {
                    done(err, result);
                });

            },
            function(result, done) {

                // get organization admin user by organizationId
                userModel.findOne({                    
                    status: 1,
                    permission: Const.userPermission.organizationAdmin,
                    organizationId: result.organization._id
                }, function(err, findResult) {
                    
                    if (err) {
                        done(err, result);
                        return;
                    }

                    if (findResult) {

                        result.user = findResult;
                        done(null, result);
                                        
                    } else {

                        done("Organization does not exist.", result);

                    }
               
                });

            },
            function(result, done) {

                if (!_.isEmpty(result.organization.email)) {

                    var adminURL = Config.protocol + request.headers.host + 
                        "/admin/signin?organizationId=" + organizationId + 
                        "&username=" + result.user.userid;

                    var newLine = "<br/>";            

                    var body = self.l10n("Regards,") + newLine + newLine + 
                        self.l10n("New user is registered to organization: ") + result.organization.name + "." + newLine + newLine + 
                        self.l10n("Username: ") + formValues.username + newLine + newLine + newLine + 
                        self.l10n("If you want to further administer users, login here: ") + adminURL + newLine + newLine + 
                        self.l10n("Best regards,") + newLine + 
                        self.l10n("Spika team");

                    Utils.sendEmail(result.organization.email, self.l10n("New user registration"), body, true, (err, info) => {
                        
                        done(err, result);
                    
                    });        

                } else {

                    done(null, result);

                }         

            },
            function(result, done) {

                NewUserLogic.create(
                    null, 
                    null, 
                    null, 
                    formValues.username, 
                    formValues.password[1],
                    null,
                    result.organization._id,
                    null,
                    null,
                    null,
                function(err, saveResult) {

                    done(err, result);
                    
                });
                
            }
        ],
        function (err, result) {

            if (err) {

                self.renderSignup(request, response, '/Signup/UserSignup', {
                    errorMessage: (err.errorMessage) ? self.l10n(err.errorMessage) : self.l10n(err), 
                    focusField: err.focusField, 
                    username: formValues.username,
                    password: formValues.password[1],
                    reenterPassword: formValues.reenterPassword,
                    organizationName: (result.organization) ? result.organization.name : ""
                });

                return;
            }
        
            self.renderSignup(request, response, '/Signup/UserSignupFinish');

        });

    });

    return router;
    
}

SignupController.prototype.validation = function(request, response, isAdminSignup, callback) {

    var formValues = request.body;

    var organizationId = "";

    if (isAdminSignup)
        organizationId = formValues.organizationId;
    else
        organizationId = request.params.organizationId;

    var organizationModel = OrganizationModel.get();
    var userModel = UserModel.get();

    var error = null;

    async.waterfall([

        function(done) {

            if (_.isEmpty(organizationId) && isAdminSignup) { 

                error = {
                    errorMessage: 'Please enter organization ID.',
                    focusField: "organizationId"
                };

            } else if (!Const.REUsername.test(organizationId) && isAdminSignup) {
                
                error = {
                    errorMessage: 'Organization ID must contain only alphabet and number, and more than 6 characters.',
                    focusField: "organizationId"
                };

            } else if (_.isEmpty(formValues.username)) {

                error = {
                    errorMessage: 'Please enter user name.',
                    focusField: "username"
                };

            } else if (!Const.REUsername.test(formValues.username)) {
            
                error = {
                    errorMessage: 'User name must contain only alphabet and number, and more than 6 characters.',
                    focusField: "username"
                };

            } else if (_.isEmpty(formValues.password[1])) {
                
                error = {
                    errorMessage: 'Please enter password.',
                    focusField: "password"
                };

            } else if (!Const.REPassword.test(formValues.password[1])) {
            
                error = {
                    errorMessage: 'Password must contain only alphabet and number, and more than 6 characters.',
                    focusField: "password"
                };

            } else if (_.isEmpty(formValues.reenterPassword)) {
                
                error = {
                    errorMessage: 'Please re-enter password.',
                    focusField: "reenterPassword"
                };

            } else if (formValues.password[1] != formValues.reenterPassword) {
            
                error = {
                    errorMessage: 'Passwords does not match.',
                    focusField: "reenterPassword"
                };

            }

            done(error, {});

        },
        function(result, done) {

            // check duplicate organization ID
            organizationModel.findOne({ organizationId: Utils.getCIString(organizationId) }, function(err, findResult) {
        
                if (findResult) {

                    if (isAdminSignup) {
                        error = {
                            errorMessage: 'The organization ID is taken.',
                            focusField: "organizationId"
                        };
                    }

                    result.organization = findResult;

                }

                done(error, result);
                
            });

        },
        function(result, done) {
            
            if (!isAdminSignup) {

                // check duplicate username
                userModel.findOne({ 
                    userid: Utils.getCIString(formValues.username),
                    organizationId: result.organization._id
                }, function(err, findResult) {

                    if(findResult) { 
                        
                        error = {
                            errorMessage: 'The user name is taken.',
                            focusField: "username"
                        };
            
                    }

                    done(error, result);
                                                 
                });  

            } else {
                done(null, result);
            }

        }
    ],
    function(err, result) {

        callback(err);

    });

}

module["exports"] = new SignupController();