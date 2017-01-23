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

    describe('login', function () {
        
        it('login passes with all parameters provided.', function (done) {
            
        	var params = {
                token : global.user1.accessToken
        	};
        	
            var client1 = io.connect(socketURL, connectOptions);
            
            client1.on('connect', function(data){
                
                client1.emit('login',params);
                
            });

            client1.on('logined', function(){
                
                client1.disconnect();
                
                done();

            });
            
        });

        it('login faild if token is invalid', function (done) {
            
        	var params = {
                token : "invalid token"
        	};
        	
            var client1 = io.connect(socketURL, connectOptions);
            
            client1.on('connect', function(data){
                
                client1.emit('login',params);
                
            });

            client1.on('socketerror', function(param){
                
                param.should.have.property('code');
                param.code.should.equal(4000007);
                
                client1.disconnect();
                
                done();
                
            });
            
        });

    describe('get online status', function () {
        
        it('get online status work', function (done) {
            
            var counter = 0;
            
        	var params = {
                token : global.user1.accessToken
        	};
        	
            var client1 = io.connect(socketURL, connectOptions);
            
            client1.on('connect', function(data){
                
                client1.emit('login',params);
                
            });

            client1.on('logined', function(){
                
                counter++;
                if(counter == 2) proceeed();
                
            });

        	var params2 = {
                token : global.user2.accessToken
        	};
            
            var client2 = io.connect(socketURL, connectOptions);
            
            client2.on('connect', function(data){
                
                client1.emit('login',params2);
                
            });

            client2.on('logined', function(){

                counter++;
                if(counter == 2) proceeed();
                
            });
            
            function proceeed(){

                request(app)
                    .post('/api/v2/user/online')
                    .set('access-token', global.user1.accessToken)
                    .send({
                        users:[
                            global.user1._id,
                            global.user2._id,
                            global.user3._id
                        ]
                    })
                    .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(1);
                    res.body.should.have.property('data');
                    res.body.data.should.be.instanceof(Array).and.have.lengthOf(3);
                    res.body.data[0].onlineStatus.should.equal(1);
                    res.body.data[2].onlineStatus.should.equal(0);
                    
                    done();
                    
                });  

            }
        });

    });
    
/*
        it('Login failed if userID is not provided', function (done) {
            
            var responseCount = 0;
            
        	var params = {
                channelID : "test",
                user : {
					userID:"",
					avatarURL:"ssssss",
					name:"name"
				},
        	};
        	
            var client1 = io.connect(socketURL, connectOptions);
            
            client1.on('connect', function(data){
                
                client1.emit('jointochannel',params);
                
            });

            
            client1.on('socketerror', function(data){
                

                data.code.should.equal(3000018);
                done();
                client1.disconnect();
                
            });

        });

        it('Login failed if roomID is not provided', function (done) {
            
            var responseCount = 0;
            
        	var params = {
                channelID : "",
                user : {
					userID:"testtest",
					avatarURL:"ssssss",
					name:"name"
				},
        	};
        	
            var client1 = io.connect(socketURL, connectOptions);
            
            client1.on('connect', function(data){
                
                client1.emit('jointochannel',params);
                
            });
            
            client1.on('socketerror', function(data){
                
                data.code.should.equal(3000017);
                done();
                client1.disconnect();
                
            });

        });
*/
        
    });

});