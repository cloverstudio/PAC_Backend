var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

var SpikaSDK = require('../../client/js/sdk/main');

describe('API', function () {

    var req, res;

    describe('SDK signin', function () {
    
        it('should work', function (done) {

            SpikaSDK.init('http://localhost:8081/api/v3',global.apikey);

            SpikaSDK.signin(global.organization1.name,
                global.user1.userid,
                global.user1.passwordOrig,
                function(statusCode,body){

                    console.log(statusCode,body);
                    done();

            });

        });
        
    });
    
});