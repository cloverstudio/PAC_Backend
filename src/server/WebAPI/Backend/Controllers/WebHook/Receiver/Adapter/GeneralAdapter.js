/** This is used when system cannot recognise from what the request is */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../../../";

var Const = require(pathTop +"lib/consts");
var Config = require(pathTop +"lib/init");
var Utils = require(pathTop +'lib/utils');

var GeneralAdapter = function(request){
    this.request = request;
}

GeneralAdapter.prototype.createMessage = function(callBack){

    var params = this.request.body;
    
    var name = "Bot";
    var message = "WebHook";
    var avatar = "http://www.spika.chat/images/avtar_robot.png";
    var identifier = "0001";
    
    if(params.name)
        name = params.name;
        
    if(params.message)
        message = params.message;

    if(params.avatarURL)
        avatar = params.avatarURL;

    if(params.identifier)
        identifier = params.identifier; 
        
    var message = {
        name: name,
        message : message,
        type : 1,
        avatarURL : avatar,
        serviceIdentifier: identifier
    };

    callBack(message);
    
}

module["exports"] = GeneralAdapter;
