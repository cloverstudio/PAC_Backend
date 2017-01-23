var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var sha1 = require('sha1');
var util = require('util');
var sha1 = require('sha1');

describe('WEB API', function () {

    var req, res;

    describe('/room/leave POST', function () {

        it('Leave room works', function (done) {

            request(app)
                .post('/api/v2/room/leave')
                .set('access-token', global.user1.accessToken)
                .send({
                    roomId:  global.room1._id
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
                                       
    });

});