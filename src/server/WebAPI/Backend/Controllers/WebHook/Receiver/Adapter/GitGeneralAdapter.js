/** Used for general git web hook  */

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
    
    var name = "Git";
    var message = "New Commit to repository \n" + params.commits[0].url;
    var avatar = "https://git-scm.com/images/logos/logomark-white@2x.png";
    var identifier = "0002";
    
    if(params.name)
        name = params.name;
        
    if(params.message)
        message = params.message;

    if(params.avatarURL)
        avatar = params.avatarURL;
         
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
