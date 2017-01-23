var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var sha1 = require('sha1');
var util = require('util');

describe('WEB API', function () {

    var req, res;

    describe('/user/detail GET', function () {

        it('works', function (done) {

            request(app)
                .get('/api/v2/user/detail/' + global.user1._id)
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

        it('wrong userid', function (done) {

            request(app)
                .get('/api/v2/user/detail/wrong')
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}
                  
                res.body.should.have.property('code');
                res.body.code.should.equal(4000017);

                done();
                
            });   
            
        });
        
    });

    describe('/group/detail GET', function () {

        it('works', function (done) {

            request(app)
                .get('/api/v2/group/detail/' + global.group1._id)
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}
                
                //console.log(util.inspect(res.body, {showHidden: false, depth: null}));
                
                res.body.should.have.property('code');
                res.body.code.should.equal(1);

                done();
                
            });   
            
        });

        it('wrong group id', function (done) {

            request(app)
                .get('/api/v2/group/detail/wrong')
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}
                  
                res.body.should.have.property('code');
                res.body.code.should.equal(4000018);

                done();
                
            });   
            
        });
        
    });


    describe('/room/detail GET', function () {

        it('works', function (done) {
            
            request(app)
                .get('/api/v2/room/detail/' + global.room1._id)
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

        it('wrong room id', function (done) {

            request(app)
                .get('/api/v2/room/detail/wrong')
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}
                  
                res.body.should.have.property('code');
                res.body.code.should.equal(4000019);

                done();
                
            });   
            
        });
        
    });
    
    
});