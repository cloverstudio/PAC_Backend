var request = require('supertest');
var app = require('../mainTest');
var util = require('util');
var Const = require("../lib/consts");


describe('WEB API', function () {

    var req, res;

    describe('/todo/add POST', function () {

        it('fails if invalid token', function (done) {

            request(app)
                .post('/api/v2/todo/add')
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

        it('fails if no chatId', function (done) {

            request(app)
                .post('/api/v2/todo/add')
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeTodoNoChatId);

                    done();

                });

        });

        it('fails if no text', function (done) {

            request(app)
                .post('/api/v2/todo/add')
                .set('access-token', global.user1.accessToken)
                .send({
                    chatId: Const.chatTypeRoom + "-" + global.room1._id.toString()
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeTodoNoText);

                    done();

                });

        });

        it('fails if wrong assigned userId', function (done) {

            request(app)
                .post('/api/v2/todo/add')
                .set('access-token', global.user1.accessToken)
                .send({
                    chatId: Const.chatTypeRoom + "-" + global.room1._id.toString(),
                    text: "text",
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
                .post('/api/v2/todo/add')
                .set('access-token', global.user1.accessToken)
                .send({
                    chatId: Const.chatTypeRoom + "-" + global.room1._id.toString(),
                    text: "text"
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeSucceed);

                    res.body.should.have.property('data');
                    res.body.data.should.have.property('todo');
                    res.body.data.todo.should.have.property('_id');

                    global.todo._id = res.body.data.todo._id;

                    done();

                });

        });

    });

});