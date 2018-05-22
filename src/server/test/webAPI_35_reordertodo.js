var request = require('supertest');
var app = require('../mainTest');
var util = require('util');
var Const = require("../lib/consts");


describe('WEB API', function () {

    var req, res;

    describe('/todo/reorder POST', function () {

        it('fails if invalid token', function (done) {

            request(app)
                .post('/api/v2/todo/reorder')
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

        it('fails if param is not array', function (done) {

            request(app)
                .post('/api/v2/todo/reorder')
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeTodoListNotArray);

                    done();

                });

        });

        it('fails if param has wrong object properties', function (done) {

            request(app)
                .post('/api/v2/todo/reorder')
                .set('access-token', global.user1.accessToken)
                .send({
                    todoList: [
                        {
                            test: "test"
                        }
                    ]
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeTodoReorderWrongObjectProperties);

                    done();

                });

        });

        it('works', function (done) {

            request(app)
                .post('/api/v2/todo/reorder')
                .set('access-token', global.user1.accessToken)
                .send({
                    todoList: [
                        {
                            id: global.todo._id.toString(),
                            position: 1
                        }
                    ]
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