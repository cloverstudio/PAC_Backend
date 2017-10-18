var _ = require('lodash');
var async = require('async');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var SigninPhoneNumberClient = function () { };

SigninPhoneNumberClient.prototype.sendSms = function (organization, phoneNumber, success, error) {

    $.ajax({
        type: 'POST',
        crossDomain: true,
        url: Config.APIEndpoint + "/user/signup/sendSms",
        data: JSON.stringify({
            organizationId: organization,
            phoneNumber: phoneNumber,
            isWeb: 1
        }),
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function (response) {

            if (response.code != 1)
                return error(response.code);

            success(response.data);
        },
        error: function () {
            error(Const.ErrorCodes[4000000]);
        }
    });

}

SigninPhoneNumberClient.prototype.verify = function (activationCode, success, error) {

    $.ajax({
        type: 'POST',
        crossDomain: true,
        url: Config.APIEndpoint + "/user/signup/verify",
        data: JSON.stringify({
            activationCode: activationCode
        }),
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function (response) {

            if (response.code != 1)
                return error(response.code);

            success(response.data);
        },
        error: function () {
            error(Const.ErrorCodes[4000000]);
        }
    });

}

// returns instance
module["exports"] = new SigninPhoneNumberClient();