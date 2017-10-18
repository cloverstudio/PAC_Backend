var Backbone = require('backbone');
var _ = require('lodash');

var Utils = require('../../lib/utils');
var Const = require('../../lib/consts');
var Config = require('../../lib/init');

var SigninClient = require('../../lib/APIClients/SigninPhoneNumberClient');

var template = require('./SigninView.hbs');

var SigninView = Backbone.View.extend({

    container: "",
    disableAutoLogin: false,
    isGuest: false,
    initialize: function (options) {
        this.container = options.container;

        this.render();
    },

    render: function () {

        var self = this;

        $(this.container).html(template({
            Config: Config,
        }));

        this.onLoad();

        return this;

    },

    onLoad: function () {

        var self = this;

        $('#tb-organization').on('keyup', function (e) {

            var code = e.which;
            if (code != 13)
                return;

            e.preventDefault();

            var phoneNumber = $('#tb-phoneNumber').val();
            var organization = $('#tb-organization').val();

            self.doSendSms(organization, phoneNumber);

        });


        $('#tb-phoneNumber').on('keyup', function (e) {

            var code = e.which;

            if (code != 13)
                return;

            e.preventDefault();

            var phoneNumber = $('#tb-phoneNumber').val();
            var organization = $('#tb-organization').val();

            self.doSendSms(organization, phoneNumber);

        });

        $('#btn-next').on('click', function () {

            var phoneNumber = $('#tb-phoneNumber').val();
            var organization = $('#tb-organization').val();

            self.doSendSms(organization, phoneNumber);

        });

        Backbone.trigger(Const.NotificationUpdateWindowSize);

    },

    doSendSms: function (organization, phoneNumber, onError) {

        $('#alert-error').hide();

        $('#btn-next').attr('disabled', 'disabled');
        $('#btn-next').addClass('disabled');
        $('#btn-next i').removeClass('hide');

        SigninClient.sendSms(organization, phoneNumber, function (data) {

            Utils.goPage('verify');

            $('#btn-next').removeAttr('disabled');
            $('#btn-next').removeClass('disabled');
            $('#btn-next i').addClass('hide');

        }, function (errCode) {

            $('#btn-next').removeAttr('disabled');
            $('#btn-next').removeClass('disabled');
            $('#btn-next i').addClass('hide');

            $('#alert-error').show();

            $('#error-title').text(Utils.l10n('Failed to send SMS'));
            $('#error-desc').text(Utils.l10n(Const.ErrorCodes[errCode]));

            if (onError) {
                onError();
            }

        });

    }

});

module.exports = SigninView;
