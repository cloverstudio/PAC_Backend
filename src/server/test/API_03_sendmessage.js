var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

describe('API', function () {

    var req, res;

    describe('/v3/message/send POST', function () {
    
        it('message send works', function (done) {

            request(app)
                .post('/api/v3/message/send')
                .set('apikey', global.apikey)
                .set('access-token', global.apiaccesstoken)
                .send({
                    targetType:1, // private message
                    target: global.user1._id,
                    messageType: 1, // text message
                    message: "hi"
                })
                .expect(200) 
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('message');
                res.body.message.should.have.property('_id');
                
                done();
            
            });   
            
        });

        it('wrong apikey', function (done) {

            request(app)
                .post('/api/v3/message/send')
                .set('apikey', "sss")
                .set('access-token', global.apiaccesstoken)
                .expect(401) 
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}
                
                done();
            
            });   
            
        });

        it('wrong access token', function (done) {

            request(app)
                .post('/api/v3/message/send')
                .set('apikey', global.apikey)
                .set('access-token', "sssss")
                .expect(403) 
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}
                
                done();
            
            });   
            
        });

    });
    
});