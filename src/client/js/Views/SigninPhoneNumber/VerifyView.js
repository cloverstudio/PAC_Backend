var Backbone = require('backbone');
var _ = require('lodash');

var Utils = require('../../lib/utils');
var Const = require('../../lib/consts');
var Config = require('../../lib/init');

var SigninClient = require('../../lib/APIClients/SigninPhoneNumberClient');
var SocketIOManager = require('../../lib/SocketIOManager');
var loginUserManager = require('../../lib/loginUserManager');

var template = require('./VerifyView.hbs');

var VerifyView = Backbone.View.extend({

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

        $('#tb-activationCode').on('keyup', function (e) {

            var code = e.which;

            if (code != 13)
                return;

            e.preventDefault();

            var activationCode = $('#tb-activationCode').val();

            self.doLogin(activationCode);

        });

        $('#btn-login').on('click', function () {

            var activationCode = $('#tb-activationCode').val();

            self.doLogin(activationCode);

        });

        Backbone.trigger(Const.NotificationUpdateWindowSize);

    },

    doLogin: function (activationCode, onError) {

        $('#alert-error').hide();

        $('#btn-login').attr('disabled', 'disabled');
        $('#btn-login').addClass('disabled');
        $('#btn-login i').removeClass('hide');

        SigninClient.verify(activationCode, function (data) {

            if (data.user && !_.isEmpty(data.newToken)) {

                loginUserManager.setUser(data.user);
                loginUserManager.setToken(data.newToken);
                loginUserManager.organization = data.organization;
                console.log(data)
                SocketIOManager.init();

                Utils.goPage('open');

            } 
            else {

                if (onError) {
                    onError();
                }

            }

        }, function (errCode) {

            $('#btn-login').removeAttr('disabled');
            $('#btn-login').removeClass('disabled');
            $('#btn-login i').addClass('hide');

            $('#alert-error').show();

            $('#error-title').text(Utils.l10n('Failed to login'));
            $('#error-desc').text(Utils.l10n(Const.ErrorCodes[errCode]));

            if (onError) {
                onError();
            }

        });

    }

});

module.exports = VerifyView;