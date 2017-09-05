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
                    username: global.user1.userid,
                    password: global.user1.passwordOrig
                })
                .expect(200) 
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('access-token');
                    global.user1.apiaccesstoken = res.body['access-token'];                
                });
            
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
                    global.user2.apiaccesstoken = res.body['access-token'];
                });
            
            request(app)
                .post('/api/v3/user/signin')
                .set('apikey', global.apikey)
                .send({
                    organization:global.organization1.name,
                    username: global.user3.userid,
                    password: global.user3.passwordOrig
                })
                .expect(200) 
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('access-token');
                    global.user3.apiaccesstoken = res.body['access-token'];
                    done();
                });
        }); 
    });
});