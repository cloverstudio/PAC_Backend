var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var Const = require("../lib/consts");

describe('WEB API', function () {

    var req, res;

    describe('/user/signup/sendSms POST', function () {

        it('works', function (done) {

            request(app)
                .post('/api/v2/user/signup/sendSms')
                .send({
                    organizationId: global.organization1.name,
                    phoneNumber: "+15005550006",
                    isUnitTest: true
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeSucceed);
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('activationCode');

                    global.user1.activationCode = res.body.data.activationCode;

                    done();

                });

        });

        it('no organizationId', function (done) {

            request(app)
                .post('/api/v2/user/signup/sendSms')
                .send({
                    organizationId: "",
                    phoneNumber: "+15005550006"
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeSignupNoOrganizationId);

                    done();

                });

        });

        it('wrong organizationId', function (done) {

            request(app)
                .post('/api/v2/user/signup/sendSms')
                .send({
                    organizationId: "wrong",
                    phoneNumber: "+15005550006"
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeSigninWrongOrganizationId);

                    done();

                });

        });

    });

    describe('/api/v2/user/signup/verify POST', function () {

        it('works', function (done) {

            request(app)
                .post('/api/v2/user/signup/verify')
                .send({
                    activationCode: global.user1.activationCode
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeSucceed);
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('newToken');
                    res.body.data.should.have.property('user');

                    done();

                });

        });

        it('invalid activation code', function (done) {

            request(app)
                .post('/api/v2/user/signup/verify')
                .send({
                    activationCode: "invalid"
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeSignupInvalidActivationCode);

                    done();

                });

        });

    });

    describe('/api/v2/user/signup/finish POST', function () {

        it('works without file', function (done) {

            request(app)
                .post('/api/v2/user/signup/finish')
                .set('access-token', global.user1.accessToken)
                .field("name", "test")
                .field("password", "123456789")
                .field("secret", "")
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeSucceed);
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('user');

                    done();

                });

        });

    });

});