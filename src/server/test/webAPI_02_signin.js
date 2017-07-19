var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var sha1 = require('sha1');

describe('WEB API', function () {

    var req, res;

    describe('/user/signin POST', function () {
    
        it('should get token', function (done) {

            request(app)
                .get('/api/v2/test')
                .expect(200) 
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property("time");

                var time = res.body.time;
                
                // generate secret
                var tenSec = Math.floor(time / 1000 / 10);
                var key =  global.hashsalt + tenSec;
                var secret = sha1(key);


                request(app)
                    .post('/api/v2/user/signin')
                    .send({
                    	organizationid:global.organization1.name,
                        userid: global.user2.userid,
                        password: global.user2.password,
                        secret: secret
                    })
                    .end(function (err, res) {

                    if (err) {
                        throw err;
                    }
                    
                    res.body.should.have.property('code');
                    res.body.code.should.equal(1);
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('newToken');
                    
                    global.user2.accessToken = res.body.data.newToken;

                }); 

                request(app)
                    .post('/api/v2/user/signin')
                    .send({
                    	organizationid:global.organization1.name,
                        userid: global.user3.userid,
                        password: global.user3.password,
                        secret: secret
                    })
                    .end(function (err, res) {

                    if (err) {
                        throw err;
                    }
                    
                    res.body.should.have.property('code');
                    res.body.code.should.equal(1);
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('newToken');
                    
                    global.user3.accessToken = res.body.data.newToken;

                }); 

                request(app)
                    .post('/api/v2/user/signin')
                    .send({
                    	organizationid:global.organization1.name,
                        userid: global.user4.userid,
                        password: global.user4.password,
                        secret: secret
                    })
                    .end(function (err, res) {

                    if (err) {
                        throw err;
                    }
                    
                    res.body.should.have.property('code');
                    res.body.code.should.equal(1);
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('newToken');
                    
                    global.user4.accessToken = res.body.data.newToken;

                }); 
                
                request(app)
                    .post('/api/v2/user/signin')
                    .send({
                    	organizationid:global.organization1.name,
                        userid: global.user1.userid,
                        password: global.user1.password,
                        secret: secret
                    })
                    .end(function (err, res) {

                    if (err) {
                        throw err;
                    }
                    
                    res.body.should.have.property('code');
                    res.body.code.should.equal(1);
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('newToken');
                    
                    global.user1.accessToken = res.body.data.newToken;
                    
                    done();
                
                }); 
            
            });   
            
        });

       it('fails if password is wrong', function (done) {

            request(app)
                .get('/api/v2/test')
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property("time");

                var time = res.body.time;
                
                // generate secret
                var tenSec = Math.floor(time / 1000 / 10);
                var key =  global.hashsalt + tenSec;
                var secret = sha1(key);

                request(app)
                    .post('/api/v2/user/signin')
                    .send({
                    	organizationid:global.organization1.name,
                        userid: global.user1.userid,
                        password: global.user1.password + "wrong",
                        secret: secret
                    })
                    .end(function (err, res) {

                    if (err) {
                        throw err;
                    }
                    
                    res.body.should.have.property('code');
                    res.body.code.should.equal(4000006);
                    
                    done();
                
                }); 
            
            });   
  
        });

      it('fails if secret is wrong', function (done) {

            request(app)
                .post('/api/v2/user/signin')
                .send({
                	organizationid:global.organization1.name,
                    userid: global.user1.userid,
                    password: global.user1.password + "wrong",
                    secret: "wrong secret"
                })
                .end(function (err, res) {

                if (err) {
                    throw err;
                }
                
                res.body.should.have.property('code');
                res.body.code.should.equal(4000004);
                
                done();
            
            });  
  
            
        });
        
    });
    
    describe('/user/savepushtoken GET', function () {
        
      it('save push token works', function (done) {

            request(app)
                .post('/api/v2/user/savepushtoken')
                .send({
                    pushToken: "pushtoken",
                })
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

      it('failed when pushtoken is not sent', function (done) {

            request(app)
                .post('/api/v2/user/savepushtoken')
                .send({

                })
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

                if (err) {
                    throw err;
                }
                
                res.body.should.have.property('code');
                res.body.code.should.equal(4000031);
                
                done();
            
            });  
  
            
        });
        
    });
});