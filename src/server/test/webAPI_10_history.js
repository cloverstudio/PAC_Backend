var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var sha1 = require('sha1');
var util = require('util');

describe('WEB API', function () {

    var req, res;

    describe('/history GET', function () {
    
        it('fails if invalid token', function (done) {

            request(app)
                .get('/api/v2/user/history/1')
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

        it('works', function (done) {

            request(app)
                .get('/api/v2/user/history/1')
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

    describe('/history/markall POST', function () {
    
        it('works', function (done) {

            request(app)
                .post('/api/v2/user/history/markall')
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
    
    describe('/history/markchat POST', function () {
        
        it('works', function (done) {

            request(app)
                .post('/api/v2/user/history/markchat')
                .set('access-token', global.user1.accessToken)
                .send({
                    chatId:global.room1._id,
                    chatType:"3"
                })
                .end(function (err, res) {
                
                if (err) {
                    throw err;
                }

                console.log(res.body);

                res.body.should.have.property('code');
                res.body.code.should.equal(1);

                done();
                
            });   
            
        });
        
    });

});