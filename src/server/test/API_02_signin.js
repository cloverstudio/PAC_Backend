var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

describe('API', function () {

    var req, res;

    describe('/v3/user/signin POST', function () {
    
        it('should be test', function (done) {

            request(app)
                .post('/api/v3/user/signin')
                .set('apikey', global.apikey)
                .send({
                    organization:global.organization1.name,
                    username: global.user2.userid,
                    password: global.user2.passwordOrig
                })
                .expect(200) 
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('access-token');
                global.apiaccesstoken = res.body['access-token'];

                done();
            
            });   
            
        });
        
    });
    
});