var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var util = require('util');

describe('WEB API', function () {

    var req, res;

    describe('/user/blocklist GET', function () {
    
        it('should work blocklist', function (done) {

            request(app)
                .post('/api/v2/user/block')
                .set('access-token', global.user1.accessToken)
                .send({
                    action : 'block',
                    target : global.user2._id
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                request(app)
                    .get('/api/v2/user/blocklist')
                    .set('access-token', global.user1.accessToken)
                    .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(1);
                    
                    console.log(util.inspect(res.body, {showHidden: false, depth: null}));
                    
                    done();
                    
                });   
                
            });   
            
        });

    });
    
});