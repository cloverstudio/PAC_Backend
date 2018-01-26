var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var Const = require("../lib/consts");

describe('WEB API', function () {

    var req, res;

    describe('/message/deliver POST', function () {

        it('Message delivered works', function (done) {

            request(app)
                .post('/api/v2/message/deliver')
                .set('access-token', global.user2.accessToken)
                .send({
                    messageId: global.message1._id
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(1);

                    done();

                });

        });

        it('Fails if there is no messageId', function (done) {

            request(app)
                .post('/api/v2/message/deliver')
                .set('access-token', global.user2.accessToken)
                .send({
                    messageId: ""
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeDeliverMessageNoMessageId);

                    done();

                });

        });

        it('Fails if invalid messageId', function (done) {

            request(app)
                .post('/api/v2/message/deliver')
                .set('access-token', global.user2.accessToken)
                .send({
                    messageId: "invalid"
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeDeliverMessageWrongMessageId);

                    done();

                });

        });

        it('Fails if user is sender', function (done) {

            request(app)
                .post('/api/v2/message/deliver')
                .set('access-token', global.user1.accessToken)
                .send({
                    messageId: global.message1._id
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeDeliverMessageUserIsSender);

                    done();

                });

        });

    });

});