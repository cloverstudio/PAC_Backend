var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var sha1 = require('sha1');
var util = require('util');

describe('WEB API', function () {

    var req, res;

    describe('/user/list GET', function () {
    
        it('fails if invalid token', function (done) {

            request(app)
                .get('/api/v2/user/list')
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

        it('fails if invalid is empty', function (done) {

            request(app)
                .get('/api/v2/user/list')
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(4000007);

                done();
                
            });   
            
        });
        
    });
    
    describe('/user/list GET', function () {
    
        it('works', function (done) {

            request(app)
                .get('/api/v2/user/list')
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.should.have.property('data');
                res.body.data.should.have.property('list');
                res.body.data.should.have.property('count');

                done();
                
            });   
            
        });

        it('works paging', function (done) {

            request(app)
                .get('/api/v2/user/list/1')
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.should.have.property('data');
                res.body.data.should.have.property('list');
                res.body.data.should.have.property('count');

                done();
                
            });   
            
        });
        
    });

    describe('/user/search GET', function () {
    
        it('works', function (done) {

            request(app)
                .get('/api/v2/user/search?keyword=user1')
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.should.have.property('data');
                res.body.data.should.have.property('list');
                res.body.data.should.have.property('count');

                done();
                
            });   
            
        });

    });
    
});