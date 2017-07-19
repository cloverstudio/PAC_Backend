var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

describe('WEB API', function () {

    var req, res;

    describe('/v3/user/signin POST', function () {
    
        it('should be test', function (done) {

            request(app)
                .post('/api/v3/user/signin')
                .set('apikey', global.apikey)
                .send({
                    organizationid:global.organization1.name,
                    userid: global.user2.userid,
                    password: global.user2.password
                })
                .expect(200) 
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.be.exactly("test");
                
                done();
            
            });   
            
        });
        
    });
    
});