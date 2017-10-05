var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

describe('API', function () {

    var req, res;

    describe('/v3/files/upload POST', function () {
    
        it('file upload works', function (done) {

            request(app)
                .post('/api/v3/files/upload')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .attach('file', './src/server/test/samplefiles/max.jpg')
                .expect(200) 
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('file');
                res.body.should.have.property('thumbnail');
                
                res.body.file.should.have.property('fileId');

                global.APIFile1 = res.body.file.fileId;

                done();
            
            });   
            
        });

        it('wrong apikey', function (done) {

            request(app)
                .post('/api/v3/files/upload')
                .set('apikey', "sss")
                .set('access-token', global.user2.apiaccesstoken)
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
                .post('/api/v3/files/upload')
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