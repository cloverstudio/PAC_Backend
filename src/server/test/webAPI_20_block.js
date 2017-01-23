var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

describe('WEB API', function () {

    var req, res;

    describe('/user/block POST', function () {
    
        it('should work block', function (done) {

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

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                
                //console.log(util.inspect(res.body, {showHidden: false, depth: null}));
                
                done();
                
            });   
            
        });

        it('should work unblock', function (done) {

            request(app)
                .post('/api/v2/user/block')
                .set('access-token', global.user1.accessToken)
                .send({
                    action : 'unblock',
                    target : global.user2._id
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