var request = require('supertest');
var app = require('../mainTest');
var util = require('util');
var Const = require("../lib/consts");


describe('WEB API', function () {

    var req, res;

    describe('/todo/list/:chatId GET', function () {

        it('fails if invalid token', function (done) {

            request(app)
                .get('/api/v2/todo/list/' + Const.chatTypeRoom + "-" + global.room1._id.toString())
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

        it('works', function (done) {

            request(app)
                .get('/api/v2/todo/list/' + Const.chatTypeRoom + "-" + global.room1._id.toString())
                .set('access-token', global.user1.accessToken)
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

    describe('/todo/list GET', function () {

        it('fails if invalid token', function (done) {

            request(app)
                .get('/api/v2/todo/list')
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

        it('works', function (done) {

            request(app)
                .get('/api/v2/todo/list')
                .set('access-token', global.user1.accessToken)
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