var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var sha1 = require('sha1');
var util = require('util');
var sha1 = require('sha1');

describe('WEB API', function () {

    var req, res;

    describe('/user/changepassword POST', function () {
        
        var newPassword = "yumiko";

        it('No access token', function (done) {

            var params = {
                currentPassword : 'hoge',
                newPassword : newPassword           
            };

            request(app)
                .post('/api/v2/user/updatepassword')
        		.send(params)
                .end(function (err, res) {
        
        		if (err) {
        			throw err;
        		}

                res.body.should.have.property('code');
                res.body.code.should.equal(4000007);

                done();

            });                   
                
        });
        
        it('Wrong current password', function (done) {

            var params = {
                currentPassword : 'hoge',
                newPassword : newPassword           
            };

            request(app)
                .post('/api/v2/user/updatepassword')
                .set('access-token', global.user1.accessToken)
                .send(params)
                .expect(200) 
                .end(function (err, res) {
        
                if (err) {
                    throw err;
                }
                                    
                res.body.should.have.property('code');
                res.body.code.should.equal(4000010);
        
                done();
            
            });  
    
        });
    
        it('Wrong new password', function (done) {

            var params = {
                currentPassword : global.user1.password,
                newPassword : "dd"           
            };

            request(app)
                .post('/api/v2/user/updatepassword')
                .set('access-token', global.user1.accessToken)
                .send(params)
                .expect(200) 
                .end(function (err, res) {
        
                if (err) {
                    throw err;
                }
                                    
                res.body.should.have.property('code');
                res.body.code.should.equal(4000011);
        
                done();
            
            });    
        
        });
        
        it('Change password works', function (done) {

            var params = {
                currentPassword : global.user1.password,
                newPassword : newPassword           
            };

            request(app)
                .post('/api/v2/user/updatepassword')
                .set('access-token', global.user1.accessToken)
                .send(params)
                .expect(200) 
                .end(function (err, res) {
        
                if (err) {
                    throw err;
                }
                
                // password is chaged here
                global.password1 =  newPassword;
                        
                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                
                done();
            
            });  
                
        });
                                       
    });

});