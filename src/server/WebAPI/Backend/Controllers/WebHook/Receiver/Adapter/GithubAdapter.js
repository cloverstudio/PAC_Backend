/** Use when github webhook is comming */

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
    
    var name = "Github";
    var message = "New Commit to github \n" + params.commits[0].url;
    var avatar = "https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png";
    var identifier = "0003";
    
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
