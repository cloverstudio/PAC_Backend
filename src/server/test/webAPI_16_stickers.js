var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var sha1 = require('sha1');
var util = require('util');

describe('WEB API', function () {

    var req, res;

    describe('/stickers GET', function () {

        it('works', function (done) {

            request(app)
                .get('/api/v2/stickers/' + global.user1.organizationId)
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);

                done();
                
            });   
            
        });


        it('fails if organization is wrong', function (done) {

            request(app)
                .get('/api/v2/stickers/badorganizationid')
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(4000032);

                done();
                
            });   
            
        });
        
    });
    
});