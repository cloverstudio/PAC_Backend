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

var UserModel = require('../../../Models/User');
var GroupModel = require('../../../Models/Group');
var RoomModel = require('../../../Models/Room');
var OrganizationModel = require('../../../Models/Organization');
var OrganizationSettingsModel = require('../../../Models/OrganizationSettings');

var SettingsController = function(){
}

// extends from basecontroller
_.extend(SettingsController.prototype,BackendBaseController.prototype);

SettingsController.prototype.init = function(app){
    
    var self = this;
	var menuItemName = "settings";

    router.get('/', checkUserAdmin, function(request, response) {

        var templateParams = {
            formValues : {

            }
        };

        var model = OrganizationSettingsModel.get();
        var baseUser = request.session.user;
        var baseOrganization = request.session.organization;

        var organizationId = baseOrganization._id;

        async.waterfall([function(done){

            var result = {};

            model.findOne({
                organizationId : organizationId
            },function(err,findResult){

                result.organizationSettings = findResult;

                done(err,result);

            });

        },
        function(result,done){

            if(result.organizationSettings){
                templateParams.formValues.allowMultipleDevices = result.organizationSettings.allowMultipleDevice;
            }else{
                templateParams.formValues.allowMultipleDevices = 1;
            }

            done(null,result);

        }
        ],
        function(err,result){

            self.render(request, response, '/Settings/Settings', templateParams);

        });

        

    });

    router.post('/', function(request, response) {
        

        var model = OrganizationSettingsModel.get();

        var baseUser = request.session.user;
        var baseOrganization = request.session.organization;

        var organizationId = baseOrganization._id;

        var formValues = request.body;

        async.waterfall([function(done){

            var result = {};

            model.findOne({
                organizationId : organizationId
            },function(err,findResult){

                result.organizationSettings = findResult;

                done(err,result);

            });
            
        },
        function(result,done){

            var allow = formValues.allowMultipleDevices;

            if(!result.organizationSettings){

                var modelOrgSettins = new model({
                    organizationId : organizationId,
                    allowMultipleDevice : allow
                });
            
                modelOrgSettins.save(function(err,insertResult){
                    
                    result.insertResult = insertResult;
                    done(err,result);
                    
                });
                    

            }else{

                if(result.organizationSettings.allowMultipleDevice == 1
                    && allow == "0"){

                    self.resetAllToken(organizationId);

                }

                model.update({ 
                    organizationId: organizationId 
                }, {
                    allowMultipleDevice : allow
                }, function(err, updateResult) {

                    result.updateResult = updateResult;
                    done(err,result);

                });

            }
            
        }
        ],
        function(err,result){
            
            var templateParams = {
                formValues : formValues
            };

            if(err)
                templateParams.errorMessage = self.l10n('Error happens while saving settings.');
            else
                templateParams.successMessage = self.l10n('Settings are saved.');

            self.render(request, response, '/Settings/Settings', templateParams);

        });


    });
    
    return router;
}

SettingsController.prototype.resetAllToken = function(organizationId){

    var model = UserModel.get();

    model.update(
        {organizationId:organizationId},{
        token: []
    },{
      multi: true  
    },function(err,updateResult){

        
    });

}

module["exports"] = new SettingsController();