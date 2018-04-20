var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var util = require('util');
var Const = require("../lib/consts");


describe('WEB API', function () {

    var req, res;

    describe('/user/pin POST', function () {

        it('fails if invalid token', function (done) {

            request(app)
                .post('/api/v2/user/pin')
                .set('access-token', "blablabal")
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeSigninInvalidToken);

                    done();

                });

        });

        it('fails if wrong pin param', function (done) {

            request(app)
                .post('/api/v2/user/pin')
                .set('access-token', global.user1.accessToken)
                .send({
                    pin: "test"
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodePinChatWrongPinParam);

                    done();

                });

        });

        it('fails if wrong chatId param', function (done) {

            request(app)
                .post('/api/v2/user/pin')
                .set('access-token', global.user1.accessToken)
                .send({
                    pin: 1,
                    chatId: ""
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodePinChatWrongChatIdParam);

                    done();

                });

        });

        it('works', function (done) {

            request(app)
                .post('/api/v2/user/pin')
                .set('access-token', global.user1.accessToken)
                .send({
                    pin: 1,
                    chatId: "chatId"
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeSucceed);

                    done();

                });

        });

    });

});