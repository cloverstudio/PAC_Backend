var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var util = require('util');

describe('WEB API', function () {

    var req, res;


    describe('/file/download GET', function () {

        it('download file works', function (done) {
    	
            request(app)
                .get('/api/v2/file/' + global.file1)
        		.expect(200) 
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}
                                
                done();
            
            });   
            
        });
               
    });
    
});