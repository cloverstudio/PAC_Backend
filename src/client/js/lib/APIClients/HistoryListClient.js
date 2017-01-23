var JSON = require('JSON2');
var _ = require('lodash');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var APIClientBase = require('./ApiClientBase');

var HistoryListClient = function(){};

_.extend(HistoryListClient.prototype,APIClientBase.prototype);

HistoryListClient.prototype.send = function(page,success,err){
    
    this.getRequst("/user/history/" + page,success,err);

}

HistoryListClient.prototype.sendUpdate = function(lastUpdate,success,err){
    
    this.getRequst("/user/history/diff/" + lastUpdate,success,err);
    
}

// returns instance
module["exports"] = new HistoryListClient();