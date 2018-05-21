var request = require('supertest');
var app = require('../mainTest');
var util = require('util');
var Const = require("../lib/consts");


describe('WEB API', function () {

    var req, res;

    describe('/todo/edit POST', function () {

        it('fails if invalid token', function (done) {

            request(app)
                .post('/api/v2/todo/edit/' + global.todo._id.toString())
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
                .post('/api/v2/todo/edit/test')
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

        it('fails if wrong assigned userId', function (done) {

            request(app)
                .post('/api/v2/todo/edit/' + global.todo._id.toString())
                .set('access-token', global.user1.accessToken)
                .send({
                    assignedUserId: "test"
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeTodoWrongAssignedUserId);

                    done();

                });

        });

        it('works', function (done) {

            request(app)
                .post('/api/v2/todo/edit/' + global.todo._id.toString())
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeSucceed);

                    res.body.should.have.property('data');
                    res.body.data.should.have.property('todo');

                    done();

                });

        });

    });

});