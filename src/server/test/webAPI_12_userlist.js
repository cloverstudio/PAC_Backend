var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var sha1 = require('sha1');
var util = require('util');

describe('WEB API', function () {

    var req, res;

    describe('/group/users GET', function () {

        it('works', function (done) {

            request(app)
                .get('/api/v2/group/users/' + global.group1._id + "/1")
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

    describe('/room/users GET', function () {

        it('works', function (done) {

            request(app)
                .get('/api/v2/group/users/' + global.group1._id + "/1")
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
    
    describe('/room/users/all GET', function () {

        it('works', function (done) {

            request(app)
                .get('/api/v2/group/users/' + global.group1._id + "/all")
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