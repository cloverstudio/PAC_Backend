var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

describe('WEB API', function () {

    var req, res;

    describe('/message/seenby GET', function () {

        it('Message seen by works', function (done) {

            request(app)
                .get('/api/v2/message/seenby/' + global.message1._id)
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.data.seenBy[0].user._id.should.be.exactly(global.user2._id);

                    done();

                });

        });

    });

});