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

                client1.emit('sendMessage', {
                    roomID: "1-" + global.user1._id + "-" + global.user2._id,
                    userID: global.user1._id,
                    type: 1,
                    message: global.encryptedText
                });

            });

            client1.on('newmessage', function (param) {

                client1.emit('deliverMessage', {
                    userID: global.user2._id,
                    messageID: param._id
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

                client1.emit('sendMessage', {
                    roomID: "2-" + global.group1._id,
                    userID: global.user1._id,
                    type: 1,
                    message: global.encryptedText
                });

            });

            client1.on('newmessage', function (param) {

                client1.emit('deliverMessage', {
                    userID: global.user2._id,
                    messageID: param._id
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

                client1.emit('sendMessage', {
                    roomID: "3-" + global.room2._id,
                    userID: global.user1._id,
                    type: 1,
                    message: global.encryptedText
                });

            });

            client1.on('newmessage', function (param) {

                client1.emit('deliverMessage', {
                    userID: global.user2._id,
                    messageID: param._id
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

        it('fails if there is no userID', function (done) {

            var params = {
                token: global.user1.accessToken
            };

            var client1 = io.connect(socketURL, connectOptions);

            client1.on('connect', function (data) {

                client1.emit('login', params);

            });

            client1.on('logined', function () {

                client1.emit('deliverMessage', {
                    userID: ""
                });

            });

            client1.on('socketerror', function (param) {

                param.should.have.property('code');
                param.code.should.equal(Const.resCodeSocketDeliverMessageNoUserId);

                client1.disconnect();

                done();

            });

        });

        it('fails if there is no messageID', function (done) {

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

        it('fails if wrong userID', function (done) {

            var params = {
                token: global.user1.accessToken
            };

            var client1 = io.connect(socketURL, connectOptions);

            client1.on('connect', function (data) {

                client1.emit('login', params);

            });

            client1.on('logined', function () {

                client1.emit('deliverMessage', {
                    userID: "wrong",
                    messageID: "messageID"
                });

            });

            client1.on('socketerror', function (param) {

                param.should.have.property('code');
                param.code.should.equal(Const.resCodeSocketDeliverMessageWrongUserId);

                client1.disconnect();

                done();

            });

        });

        it('fails if wrong messageID', function (done) {

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
                    messageID: "wrong"
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