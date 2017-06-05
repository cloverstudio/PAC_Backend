var should = require('should'); 
var assert = require('assert'); 
var mongoose = require('mongoose');
var app = require('../mainTest');
var io = require('socket.io-client');
var _ = require('lodash');
var request = require('supertest');

describe('SOCKET', function () {

    var socketURL = "http://localhost:8081/spikaenterprise";
    var connectOptions ={
        transports: ['websocket'],
        'force new connection': true
    };

    describe('send message', function () {
        
        it('send message works', function (done) {
            
        	var params = {
                token : global.user1.accessToken
        	};
        	
            var client1 = io.connect(socketURL, connectOptions);
            
            client1.on('connect', function(data){
                
                client1.emit('login',params);
                
            });

            client1.on('logined', function(){
                
                var sendMessageParams = {
                    roomID : "3-" + global.room2._id,
                    userID : global.user1._id,
                    type : 1,
                    message : "0301b8a755b0d074259a98114f78b6738401681b3762c87d6f25249001e903067cc7009beae2288379e456e6856bb3c4f22084811c05d10fa7869ac660aec60c04259926d75506a83284368805bdaca07563"
                };

                client1.emit('sendMessage',sendMessageParams);

            });
    
            client1.on('newmessage', function(param){ 
                
                global.message1 = param;
                param.should.have.property('_id');
                client1.disconnect();
                done();
                
            });
            

        });
        
    });

});