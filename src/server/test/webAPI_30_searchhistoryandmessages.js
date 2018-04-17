var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var sha1 = require('sha1');
var util = require('util');

describe('WEB API', function () {

    var req, res;

    describe('/search/historyAndMessages GET', function () {

        it('fails if invalid token', function (done) {

            request(app)
                .get('/api/v2/search/historyAndMessages')
                .set('access-token', "blablabal")
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(4000007);

                    done();

                });

        });

        it('works with keyword', function (done) {

            request(app)
                .get('/api/v2/search/historyAndMessages?keyword=room1')
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(1);

                    res.body.should.have.property('data');
                    res.body.data.should.have.property('histories');
                    res.body.data.histories.should.have.property('list');
                    res.body.data.histories.should.have.property('count');
                    res.body.data.histories.should.have.property('totalUnreadCount');

                    res.body.data.should.have.property('messages');
                    res.body.data.messages.should.have.property('messages');
                    res.body.data.messages.should.have.property('count');

                    done();

                });

        });

        it('works without keyword', function (done) {

            request(app)
                .get('/api/v2/search/historyAndMessages')
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(1);

                    res.body.should.have.property('data');
                    res.body.data.should.have.property('histories');
                    res.body.data.histories.should.have.property('list');
                    res.body.data.histories.should.have.property('count');
                    res.body.data.histories.should.have.property('totalUnreadCount');

                    res.body.data.should.have.property('messages');
                    res.body.data.messages.should.have.property('messages');
                    res.body.data.messages.should.have.property('count');

                    done();

                });

        });

    });

});