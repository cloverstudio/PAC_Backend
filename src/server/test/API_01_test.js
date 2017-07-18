var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

describe('WEB API', function () {

    var req, res;

    describe('/v3/test GET', function () {
    
        it('should be test', function (done) {

            request(app)
                .get('/api/v3/test')
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