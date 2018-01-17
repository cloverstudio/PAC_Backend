var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var sha1 = require('sha1');
var util = require('util');

describe('WEB API', function () {

    var req, res;

    describe('/message/favorite/add POST', function () {

        it('Add to favorite message works', function (done) {
            request(app)
                .post('/api/v2/message/favorite/add')
                .set('access-token', global.user1.accessToken)
                .expect(200)
                .send({
                    'messageId': global.message1._id
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
                .post('/api/v2/message/favorite/add')
                .set('access-token', global.user1.accessToken)
                .expect(200)
                .send({
                    'messageId': ''
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(4000020);

                    done();

                });


        });



        it('Fails if message is already favorited', function (done) {

            request(app)
                .post('/api/v2/message/favorite/add')
                .set('access-token', global.user1.accessToken)
                .expect(200)
                .send({
                    'messageId': global.message1._id
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(4000022);

                    done();

                });


        });

        it('Fails if invalid messageId', function (done) {

            request(app)
                .post('/api/v2/message/favorite/add')
                .set('access-token', global.user1.accessToken)
                .expect(200)
                .send({
                    'messageId': "ivalidmsgid"
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(4000021);

                    done();

                });


        });


    });



});