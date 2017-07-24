var should = require('should');
var request = require('supertest');
var async = require('async');
var fs = require('fs');

var app = require('../mainTest');

var SpikaSDK = require('../../client/js/sdk/main');

describe('API', function () {

    var req, res;

    describe('SDK signin', function () {
    
        it('should work', function (done) {

            SpikaSDK.init('http://localhost:8081/api/v3',global.apikey);

            var accessToken = "";

            async.waterfall([(doneAsync) => {

                SpikaSDK.signin(global.organization1.name,
                    global.user1.userid,
                    global.user1.passwordOrig,
                    function(statusCode,body){

                        should(statusCode).be.exactly(200).and.be.a.Number();
                        body.should.have.property('access-token');
                        body.should.have.property('user');

                        accessToken = body['access-token'];

                        doneAsync();

                });

            },
            (doneAsync) => {

                SpikaSDK.sendMessage(1,
                    global.user2.userid,
                    1,
                    'hi',
                    null,
                    function(statusCode,body){

                        should(statusCode).be.exactly(200).and.be.a.Number();
                        body.should.have.property('message');

                        doneAsync();

                });

            },
            (doneAsync) => {

                SpikaSDK.uploadFile(
                    fs.createReadStream('./src/server/test/samplefiles/max.jpg'),
                    function(statusCode,body){

                        should(statusCode).be.exactly(200).and.be.a.Number();
                        body.should.have.property('file');
                        body.should.have.property('thumbnail');

                        global.APIFile2 = body.file.fileId;
                        global.APIThumb2 = body.thumbnail.fileId;

                        doneAsync();

                });
                
            },
            (doneAsync) => {

                SpikaSDK.downloadFile(
                    global.APIFile2,
                    function(statusCode,body){

                        should(statusCode).be.exactly(200).and.be.a.Number();
                        doneAsync();

                });
                
            },
            (doneAsync) => {

                var roomID = "1-" + global.user1._id + "-" + global.user2._id;

                SpikaSDK.messageList(
                    roomID,
                    0,
                    'old',
                    function(statusCode,body){

                        should(statusCode).be.exactly(200).and.be.a.Number();

                        body.should.have.property('messages');

                        doneAsync();

                });
                
            }
            ],
            (err,result) => {
                done();
            });
            
        });
        
    });
    
});