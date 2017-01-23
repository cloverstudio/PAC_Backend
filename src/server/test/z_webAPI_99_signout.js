var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var sha1 = require('sha1');
var util = require('util');
var sha1 = require('sha1');

describe('WEB API', function () {

    var req, res;

    describe('/user/signout POST', function () {

        it('Signout workd', function (done) {
            
            request(app)
                .post('/api/v2/user/signout')
                .set('access-token', global.user1.accessToken)
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