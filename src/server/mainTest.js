var socket = require('socket.io');
var express = require('express');
var http = require('http');

var Conf = require('./lib/init.js');

// configuration for test
Conf.host = "localhost";
Conf.port = 8081;
Conf.socketNameSpace = '/spikaenterprise';
Conf.dbCollectionPrefix = '';
Conf.databaseUrl = "mongodb://localhost/spikaenterprisetest";

// initialization
var app = express();
var server = http.createServer(app);
var port = Conf.port;
var io = socket.listen(server);

var WebAPI = require('./WebAPI/WebAPIMain');
var SocketAPI = require('./SocketAPI/SocketAPIHandler');

var SpikaBridge = require('./lib/SpikaBridge');
var DatabaseManager = require('./lib/DatabaseManager');

DatabaseManager.init(function(success){

    if(!success){

        console.log('Failed to connect DB');
        process.exit(1);

    } else {

        SpikaBridge.init(app,io);
        WebAPI.init(app);
        SocketAPI.init(io);

        server.listen(Conf.port, function(){
            console.log('Server listening on port ' + Conf.port + '!');
        });

    }

});

module.exports = app;