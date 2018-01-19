var should = require('should');
var assert = require('assert');
var mongoose = require('mongoose');
var app = require('../mainTest');
var io = require('socket.io-client');
var _ = require('lodash');
var request = require('supertest');

describe('SOCKET', function () {

    var socketURL = "http://localhost:8081/spikaenterprise";
    var connectOptions = {
        transports: ['websocket'],
        'force new connection': true
    };

    describe('deliver message', function () {

        it('works for private chat', function (done) {

            var params = {
                token: global.user2.accessToken
            };

            var client1 = io.connect(socketURL, connectOptions);

            client1.on('connect', function (data) {

                client1.emit('login', params);

            });

            client1.on('logined', function () {

                client1.emit('deliverMessage', {
                    userID: global.user2._id,
                    messageID: global.message1._id
                });

            });

            client1.on('updatemessages', function (param) {

                param.should.Array();
                param.should.have.length(1);

                param[0].deliveredTo.should.Array();
                param[0].deliveredTo.should.have.length(1);

                param[0].deliveredTo[0].userId.should.equal(global.user2._id);

                client1.disconnect();

                done();

            });


        });


    });




});