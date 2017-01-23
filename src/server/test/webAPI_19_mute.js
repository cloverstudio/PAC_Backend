var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

describe('WEB API', function () {

    var req, res;

    describe('/user/mute POST', function () {
    
        it('should work mute', function (done) {

            request(app)
                .post('/api/v2/user/mute')
                .set('access-token', global.user1.accessToken)
                .send({
                    action : 'mute',
                    target : global.user2._id,
                    type : 1
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                
                //console.log(util.inspect(res.body, {showHidden: false, depth: null}));
                
                done();
                
            });   
            
        });

        it('should work unmute', function (done) {

            request(app)
                .post('/api/v2/user/mute')
                .set('access-token', global.user1.accessToken)
                .send({
                    action : 'unmute',
                    target : global.user2._id,
                    type : 1
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                
                //console.log(util.inspect(res.body, {showHidden: false, depth: null}));
                
                done();
                
            });   
            
        });

    });
    
});