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
                    phoneNumber: global.user5.phoneNumber,
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

                    global.user5.activationCode = res.body.data.activationCode;

                    done();

                });

        });

        it('no organizationId', function (done) {

            request(app)
                .post('/api/v2/user/signup/sendSms')
                .send({
                    organizationId: "",
                    phoneNumber: global.user5.phoneNumber
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
                    phoneNumber: global.user5.phoneNumber
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
                    activationCode: global.user5.activationCode
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

                    global.user5.accessToken = res.body.data.newToken;

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
                .set('access-token', global.user5.accessToken)
                .field("name", global.user5.name)
                .field("password", global.user5.password)
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

        it('works with file', function (done) {

            request(app)
                .post('/api/v2/user/signup/finish')
                .set('access-token', global.user5.accessToken)
                .field("name", global.user5.name)
                .field("password", global.user5.password)
                .field("secret", "")
                .attach('file', 'src/server/test/samplefiles/max.jpg')
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

        it('no user name', function (done) {

            request(app)
                .post('/api/v2/user/signup/finish')
                .set('access-token', global.user5.accessToken)
                .field("name", "")
                .field("password", global.user5.password)
                .field("secret", "")
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeSignupInvalidUserName);

                    done();

                });

        });

        it('no password', function (done) {

            request(app)
                .post('/api/v2/user/signup/finish')
                .set('access-token', global.user5.accessToken)
                .field("name", global.user5.name)
                .field("password", "")
                .field("secret", "")
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeSignupInvalidPassword);

                    done();

                });

        });

        it('wrong secret', function (done) {

            request(app)
                .post('/api/v2/user/signup/finish')
                .set('access-token', global.user5.accessToken)
                .field("name", global.user5.name)
                .field("password", global.user5.password)
                .field("secret", "wrong secret")
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeSigninWrongSecret);

                    done();

                });

        });

    });

});