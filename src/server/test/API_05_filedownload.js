var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

describe('API', function () {

    var req, res;

    describe('/v3/file/upload POST', function () {
    
        it('file upload works', function (done) {

            request(app)
                .get('/api/v3/file/download/' + global.APIFile1)
                .set('apikey', global.apikey)
                .set('access-token', global.apiaccesstoken)
                .expect(200) 
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                done();
            
            });   
            
        });

        it('wrong apikey', function (done) {

            request(app)
                .get('/api/v3/file/download/' + global.APIFile1)
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
                .get('/api/v3/file/download/' + global.APIFile1)
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