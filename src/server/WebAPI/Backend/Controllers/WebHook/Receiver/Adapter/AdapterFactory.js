/** Get and adaptor which support the request  */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../../../";

var Const = require(pathTop +"lib/consts");
var Config = require(pathTop +"lib/init");
var Utils = require(pathTop +'lib/utils');

var AdapterFactory = {
    
    get: function(request){
        
        var params = request.body;
        
        
        if(params.repository &&    // GITHUB
            params.commits &&
            _.isArray(params.commits) &&
            params.commits[0].url.indexOf('github') != -1){
            
            var adapter = require('./GithubAdapter');
            return new adapter(request);
            
        } else if(params.repository &&  // General Git ( mostly gitlab )
            params.commits &&
            _.isArray(params.commits)){
            
            var adapter = require('./GitGeneralAdapter');
            return new adapter(request);
            
        } else  if(params.file){
            var adapter = require('./FileAdapter');
            return new adapter(request);
        }else {
            var adapter = require('./GeneralAdapter');
            return new adapter(request);
        }
    }
}

module["exports"] = AdapterFactory;
