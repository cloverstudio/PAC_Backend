var request = require('supertest');
var app = require('../mainTest');
var util = require('util');
var Const = require("../lib/consts");


describe('WEB API', function () {

    var req, res;

    describe('/todo/delete/:id GET', function () {

        it('fails if invalid token', function (done) {

            request(app)
                .get('/api/v2/todo/delete/' + global.todo._id.toString())
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

        it('fails if todo id not found', function (done) {

            request(app)
                .get('/api/v2/todo/delete/test')
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeTodoNotFound);

                    done();

                });

        });

        it('works', function (done) {

            request(app)
                .get('/api/v2/todo/delete/' + global.todo._id.toString())
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