var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var sha1 = require('sha1');
var util = require('util');

describe('WEB API', function () {

    var req, res;

    describe('/message/favorite/list/ GET', function () {

        it('Get favorite messages with chatID works', function (done) {
            request(app)
                .get('/api/v2/message/favorite/list/3-' + global.room2._id + "/1")
                .set('access-token', global.user1.accessToken)
                .expect(200)
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(1);

                    done();

                });

        });


    });



});