var should = require('should');
var assert = require('assert');
var mongoose = require('mongoose');
var app = require('../mainTest');
var io = require('socket.io-client');
var _ = require('lodash');
var request = require('supertest');
var Const = require("../lib/consts");

describe('SOCKET', function () {

    var socketURL = "http://localhost:8081/spikaenterprise";
    var connectOptions = {
        transports: ['websocket'],
        'force new connection': true
    };

    describe('deliver message', function () {

        it('works for private chat', function (done) {

            var params = {
                token: global.user1.accessToken
            };

            var client1 = io.connect(socketURL, connectOptions);

            client1.on('connect', function (data) {

                client1.emit('login', params);

            });

            client1.on('logined', function () {

                client1.emit('deliverMessage', {
                    userID: global.user2._id,
                    messageID: global.privateMessage._id
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

        it('works for group chat', function (done) {

            var params = {
                token: global.user1.accessToken
            };

            var client1 = io.connect(socketURL, connectOptions);

            client1.on('connect', function (data) {

                client1.emit('login', params);

            });

            client1.on('logined', function () {

                client1.emit('deliverMessage', {
                    userID: global.user2._id,
                    messageID: global.groupMessage._id
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

        it('works for room chat', function (done) {

            var params = {
                token: global.user1.accessToken
            };

            var client1 = io.connect(socketURL, connectOptions);

            client1.on('connect', function (data) {

                client1.emit('login', params);

            });

            client1.on('logined', function () {

                client1.emit('deliverMessage', {
                    userID: global.user2._id,
                    messageID: global.roomMessage._id
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

        it('fails if no userId', function (done) {

            var params = {
                token: global.user1.accessToken
            };

            var client1 = io.connect(socketURL, connectOptions);

            client1.on('connect', function (data) {

                client1.emit('login', params);

            });

            client1.on('logined', function () {

                client1.emit('deliverMessage', {
                    userID: "",
                    messageID: global.roomMessage._id
                });

            });

            client1.on('socketerror', function (param) {

                param.should.have.property('code');
                param.code.should.equal(Const.resCodeSocketDeliverMessageNoUserId);

                client1.disconnect();

                done();

            });

        });

        it('fails if no messageId', function (done) {

            var params = {
                token: global.user1.accessToken
            };

            var client1 = io.connect(socketURL, connectOptions);

            client1.on('connect', function (data) {

                client1.emit('login', params);

            });

            client1.on('logined', function () {

                client1.emit('deliverMessage', {
                    userID: global.user2._id,
                    messageID: ""
                });

            });

            client1.on('socketerror', function (param) {

                param.should.have.property('code');
                param.code.should.equal(Const.resCodeSocketDeliverMessageNoMessageId);

                client1.disconnect();

                done();

            });

        });

        it('fails if invalid userId', function (done) {

            var params = {
                token: global.user1.accessToken
            };

            var client1 = io.connect(socketURL, connectOptions);

            client1.on('connect', function (data) {

                client1.emit('login', params);

            });

            client1.on('logined', function () {

                client1.emit('deliverMessage', {
                    userID: "invaliduserId",
                    messageID: global.roomMessage._id
                });

            });

            client1.on('socketerror', function (param) {

                param.should.have.property('code');
                param.code.should.equal(Const.resCodeSocketDeliverMessageWrongUserId);

                client1.disconnect();

                done();

            });

        });

        it('fails if invalid messageId', function (done) {

            var params = {
                token: global.user1.accessToken
            };

            var client1 = io.connect(socketURL, connectOptions);

            client1.on('connect', function (data) {

                client1.emit('login', params);

            });

            client1.on('logined', function () {

                client1.emit('deliverMessage', {
                    userID: global.user2._id,
                    messageID: "invalidmessageId"
                });

            });

            client1.on('socketerror', function (param) {

                param.should.have.property('code');
                param.code.should.equal(Const.resCodeSocketDeliverMessageWrongMessageId);

                client1.disconnect();

                done();

            });

        });

    });

});