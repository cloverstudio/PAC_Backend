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

    describe('SeenBy Updated By API', function () {
        
        it('seen by works for private chat', function (done) {
            
            // scenario is following
            // user1 send message to user2
            // user2 send messageOpened to server
            // user1 has to receive updatemessage with seenby

        	var params1 = {
                token : global.user1.accessToken
        	};

        	var params2 = {
                token : global.user2.accessToken
        	};
        	
        	var loggedinChecker = 0;
            var client1 = io.connect(socketURL, connectOptions);
            var client2 = io.connect(socketURL, connectOptions);

            client1.on('connect', function(data){
                
                client1.emit('login',params1);
                
            });

            client2.on('connect', function(data){
                
                client2.emit('login',params2);
                
            });

            client1.on('logined', function(){

                loggedinChecker++;

                if(loggedinChecker == 2){
                    sendMessage();
                }
            });
    
            client2.on('logined', function(){

                loggedinChecker++;

                if(loggedinChecker == 2){
                    sendMessage();
                }
            });

            function sendMessage(){

                var sendMessageParams = {
                    roomID : "1-" + global.user1._id + "-" + global.user2._id,
                    userID : global.user1._id,
                    type : 1,
                    message : global.encryptedText
                };

                client1.emit('sendMessage',sendMessageParams);

            }

            client2.on('newmessage', function(param){

                // open list
                request(app)
                    .get('/api/v2/message/list/' + "1-" + global.user1._id + "-" + global.user2._id + '/0/new')
                    .set('access-token', global.user2.accessToken)
                    .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    // update message should sent to client1
                
                });   

                
            });

            client1.on('updatemessages', function(param){ 

                param.should.Array();
                param.should.have.length(1);

                param[0].seenBy.should.Array();
                param[0].seenBy.should.have.length(1);
                
                param[0].seenBy[0].should.have.property('user');
                param[0].seenBy[0].user.should.have.property('_id');
                param[0].seenBy[0].user._id.should.equal(global.user2._id);

                client1.disconnect();

                done();
                
            });
            
        });


        it('seen by works for group chat', function (done) {
            
            // scenario is following
            // user1 send message to group
            // user2 send messageOpened to server
            // user1 has to receive updatemessage with seenby

        	var params1 = {
                token : global.user1.accessToken
        	};

        	var params2 = {
                token : global.user2.accessToken
        	};
        	
        	var loggedinChecker = 0;
            var client1 = io.connect(socketURL, connectOptions);
            var client2 = io.connect(socketURL, connectOptions);

            client1.on('connect', function(data){
                
                client1.emit('login',params1);
                
            });

            client2.on('connect', function(data){
                
                client2.emit('login',params2);
                
            });

            client1.on('logined', function(){

                loggedinChecker++;

                if(loggedinChecker == 2){
                    sendMessage();
                }
            });
    
            client2.on('logined', function(){

                loggedinChecker++;

                if(loggedinChecker == 2){
                    sendMessage();
                }
            });

            function sendMessage(){

                var sendMessageParams = {
                    roomID : "2-" + global.group1._id,
                    userID : global.user1._id,
                    type : 1,
                    message : global.encryptedText
                };

                client1.emit('sendMessage',sendMessageParams);

            }

            client2.on('newmessage', function(param){

                // open list
                request(app)
                    .get('/api/v2/message/list/' + "2-" + global.group1._id + '/0/new')
                    .set('access-token', global.user2.accessToken)
                    .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    // update message should sent to client1
                
                });   
                
            });

            client1.on('updatemessages', function(param){ 

                param.should.Array();
                param.should.have.length(1);

                param[0].seenBy.should.Array();
                param[0].seenBy.should.have.length(1);
                
                param[0].seenBy[0].should.have.property('user');
                param[0].seenBy[0].user.should.have.property('_id');
                param[0].seenBy[0].user._id.should.equal(global.user2._id);

                client1.disconnect();

                done();
                
            });
            
        });


        it('seen by works for room chat', function (done) {
            
            // scenario is following
            // user1 send message to room
            // user2 send messageOpened to server
            // user1 has to receive updatemessage with seenby

        	var params1 = {
                token : global.user1.accessToken
        	};

        	var params2 = {
                token : global.user2.accessToken
        	};
        	
        	var loggedinChecker = 0;
            var client1 = io.connect(socketURL, connectOptions);
            var client2 = io.connect(socketURL, connectOptions);

            client1.on('connect', function(data){
                
                client1.emit('login',params1);
                
            });

            client2.on('connect', function(data){
                
                client2.emit('login',params2);
                
            });

            client1.on('logined', function(){

                loggedinChecker++;

                if(loggedinChecker == 2){
                    sendMessage();
                }
            });
    
            client2.on('logined', function(){

                loggedinChecker++;

                if(loggedinChecker == 2){
                    sendMessage();
                }
            });

            function sendMessage(){

                var sendMessageParams = {
                    roomID : "3-" + global.room2._id,
                    userID : global.user1._id,
                    type : 1,
                    message : global.encryptedText
                };

                client1.emit('sendMessage',sendMessageParams);

            }

            client2.on('newmessage', function(param){

                // open list
                request(app)
                    .get('/api/v2/message/list/' + "3-" + global.room2._id + '/0/new')
                    .set('access-token', global.user2.accessToken)
                    .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    // update message should sent to client1
                
                });   
                
            });

            client1.on('updatemessages', function(param){ 

                param.should.Array();
                param.should.have.length(1);

                param[0].seenBy.should.Array();
                param[0].seenBy.should.have.length(1);
                
                param[0].seenBy[0].should.have.property('user');
                param[0].seenBy[0].user.should.have.property('_id');
                param[0].seenBy[0].user._id.should.equal(global.user2._id);

                client1.disconnect();

                done();
                
            });
            
        });

    });

});