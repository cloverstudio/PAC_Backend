var JSON = require('JSON2');
var _ = require('lodash');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var APIClientBase = require('./ApiClientBase');

var StickerListClient = function(){};

_.extend(StickerListClient.prototype,APIClientBase.prototype);

StickerListClient.prototype.send = function(organizationId,success,err){
            
    this.getRequst("/stickers",success,err);
    
}
    
// returns instance
module["exports"] = new StickerListClient();