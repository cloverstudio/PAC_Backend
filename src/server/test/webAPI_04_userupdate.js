var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var sha1 = require('sha1');
var util = require('util');

describe('WEB API', function () {

    var req, res;

    describe('/user/update POST', function () {

         it('Update profile with picture works', function (done) {
    	
            request(app)
                .post('/api/v2/user/update')
                .set('access-token', global.user1.accessToken)
                .expect(200) 
                .field('name', 'User1')
                .attach('file', 'src/server/test/samplefiles/max.jpg')
                .end(function (err, res) {
                
                if (err) {
                    throw err;
                }

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.should.have.property('data');
                res.body.data.should.have.property('user');
                res.body.data.user.should.have.property('_id');

                done();
            
            });
            
        });

         it('Update profile with picture works 2', function (done) {
    	
            request(app)
                .post('/api/v2/user/update')
                .set('access-token', global.user2.accessToken)
                .expect(200) 
                .field('name', 'User2')
                .attach('file', 'src/server/test/samplefiles/user1.jpg')
                .end(function (err, res) {
                
                if (err) {
                    throw err;
                }

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.should.have.property('data');
                res.body.data.should.have.property('user');
                res.body.data.user.should.have.property('_id');

                done();
            
            });
            
        });


         it('Update profile with picture works 3', function (done) {
    	
            request(app)
                .post('/api/v2/user/update')
                .set('access-token', global.user3.accessToken)
                .expect(200) 
                .field('name', 'User3')
                .attach('file', 'src/server/test/samplefiles/user2.jpg')
                .end(function (err, res) {
                
                if (err) {
                    throw err;
                }

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.should.have.property('data');
                res.body.data.should.have.property('user');
                res.body.data.user.should.have.property('_id');

                done();
            
            });
            
        });


         it('Update profile with picture works 4', function (done) {

            request(app)
                .post('/api/v2/user/update')
                .set('access-token', global.user4.accessToken)
                .expect(200) 
                .field('name', 'User4')
                .attach('file', 'src/server/test/samplefiles/user3.png')
                .end(function (err, res) {
                
                if (err) {
                    throw err;
                }
	            
                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.should.have.property('data');
                res.body.data.should.have.property('user');
                res.body.data.user.should.have.property('_id');

                done();
            
            });
            
        });
        
         it('Update profile without picture works', function (done) {
    	
                  
            request(app)
                .post('/api/v2/user/update')
                .set('access-token', global.user1.accessToken)
                .expect(200) 
                .field('name', 'test')
                .end(function (err, res) {

                if (err) {
                    throw err;
                }
                                    
                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                
                done();
            
            });                   
                
        });

         it('Fails if display name is empty', function (done) {
    	
            request(app)
                .post('/api/v2/user/update')
                .set('access-token', global.user1.accessToken)
                .expect(200) 
                .field('name', '')
                .attach('file', 'src/server/test/samplefiles/max.jpg')
                .end(function (err, res) {

                if (err) {
                    throw err;
                }
                
                res.body.should.have.property('code');
                res.body.code.should.equal(4000008);

                done();
            
            }); 
            
            
        });



         it('Fails if file is not image', function (done) {

            request(app)
                .post('/api/v2/user/update')
                .set('access-token', global.user1.accessToken)
                .expect(200) 
                .field('name', 'test')
                .attach('file', 'src/server/test/samplefiles/test.text')
                .end(function (err, res) {

                if (err) {
                    throw err;
                }
                
                res.body.should.have.property('code');
                res.body.code.should.equal(4000009);

                done();
            
            });
            
            
        });
           
                                         
    });

    
    
});