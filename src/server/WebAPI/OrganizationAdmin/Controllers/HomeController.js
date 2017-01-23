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

var HomeController = function(){
}

// extends from basecontroller
_.extend(HomeController.prototype,BackendBaseController.prototype);

HomeController.prototype.init = function(app){
    
    var self = this;
	var menuItemName = "home";

    router.get('/', checkUserAdmin, function(request, response) {

        var templateParams = {
            page : menuItemName,
            openMenu : menuItemName
        };

        var organizationModel = OrganizationModel.get();
        var userModel = UserModel.get();
        var groupModel = GroupModel.get();
        var roomModel = RoomModel.get();

        var organizationId = request.session.user.organizationId;

        async.waterfall([
            // get organization
            (done) => {

                organizationModel.findOne({ _id: organizationId }, (err, findResult) => {

                    done(err, { organization: findResult});

                });

            },
            // get users
            (result, done) => {

                userModel.find({ organizationId: organizationId }, { _id: 1 }, (err, findResult) => {

                    result.userIds = _.pluck(findResult, "_id");
                    done(err, result);
                    
                });

            },
            // get groups count
            (result, done) => {

                groupModel.count({ organizationId: organizationId }, (err, countResult) => {

                    result.groupCount = countResult;
                    done(err, result);
                    
                });

            },
            // get rooms count
            (result, done) => {

                roomModel.count({ owner: { $in: result.userIds } }, (err, countResult) => {

                    result.roomCount = countResult;
                    done(err, result);
                    
                });

            }
        ],
        (err, result) => {

            if (err)
                templateParams.errorMessage = self.l10n('Critical Error.') + "<br/>" + err;
            else {

                templateParams.userCount = result.userIds.length;
                templateParams.userPercentage = ((templateParams.userCount / result.organization.maxUserNumber) * 100).toFixed();

                templateParams.groupCount = result.groupCount;
                templateParams.groupPercentage = ((templateParams.groupCount / result.organization.maxGroupNumber) * 100).toFixed();

                templateParams.roomCount = result.roomCount;
                templateParams.roomPercentage = ((templateParams.roomCount / result.organization.maxRoomNumber) * 100).toFixed();
                
                templateParams.organization = result.organization;

                if (!templateParams.organization.diskUsage)
                    templateParams.organization.diskUsage = 0;

                templateParams.diskUsage = (templateParams.organization.diskUsage / Const.gigabyteToByteMultiplier).toFixed(2);
                templateParams.diskQuota = templateParams.organization.diskQuota.toFixed(2);
                templateParams.diskQuotaPercentage = ((templateParams.diskUsage / templateParams.diskQuota) * 100).toFixed();

            }

            self.render(request, response, '/Home/Home', templateParams);

        });

    });

    router.post('/', function(request, response) {
       
       var templateParams = {
        	page : menuItemName,
            openMenu : menuItemName
        };

    });
    
    return router;
}

module["exports"] = new HomeController();