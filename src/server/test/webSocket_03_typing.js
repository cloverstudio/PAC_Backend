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
        
        it('send typing works', function (done) {
            
        	var params = {
                token : global.user1.accessToken
        	};
        	
            var client1 = io.connect(socketURL, connectOptions);
            
            client1.on('connect', function(data){
                
                client1.emit('login',params);
                
            });

            client1.on('logined', function(){

                client1.emit('sendtyping',{
                    roomID: "3-" + global.room2._id,
                    userID: global.user1._id,
                    type:1 // on
                });

            });
    
            client1.on('typing', function(param){ 
                
                client1.disconnect();
                done();
                
            });
            

        });
        
    });

});