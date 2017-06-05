var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var util = require('util');

describe('WEB API', function () {

    var req, res;


    describe('/file/upload POST', function () {

        it('upload file works', function (done) {
    	
            request(app)
                .post('/api/v2/file/upload')
        		.expect(200) 
                .attach('file', './src/server/test/samplefiles/test.text')
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}
                
                res.body.should.have.property('code');
                res.body.should.have.property('data');
                res.body.data.should.have.property('file');
                res.body.data.file.should.have.property('id');

                global.file1 = res.body.data.file.id;

                done();
            
            });   
            
        });
        
        it('Upload image gives thumbnail.', function (done) {
    	
            request(app)
                .post('/api/v2/file/upload')
        		.expect(200) 
                .attach('file', './src/server/test/samplefiles/max.jpg')
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}
                
                res.body.should.have.property('code');
                res.body.should.have.property('data');
                res.body.data.should.have.property('file');
                res.body.data.file.should.have.property('id');

                res.body.data.should.have.property('thumb');
                res.body.data.thumb.should.have.property('id');
                                
                done();
            
            });   
            
        });

        it('Error when file is not provided.', function (done) {
    	
            request(app)
            
                .post('/api/v2/file/upload')
        		.expect(200) 
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}
                
                res.body.should.have.property('code');
                res.body.code.should.equal(4000069);
                                
                done();
            
            });   
            
        });
                      
    });
    
});