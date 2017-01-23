/**  Called for URL /owner/home */

var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');
var JSON = require('JSON2');

var Const = require("../../../lib/consts");
var Config = require("../../../lib/init");
var BackendBaseController = require("./BackendBaseController");
var DatabaseManager = require('../../../lib/DatabaseManager');
var Utils = require('../../../lib/utils');

var checkUserOwner = require('../../../lib/auth.js').checkUserOwner;

var HomeController = function(){
}

// extends from basecontroller
_.extend(HomeController.prototype,BackendBaseController.prototype);

HomeController.prototype.init = function(app){
    
    var self = this;
    var menuItemName = "home";

    router.get('/',checkUserOwner,function(request,response){
        
        var templateParams = {
            page : menuItemName
        };
        
        self.render(request,response,'/Home/Home',templateParams);
        
    });

    router.post('/',function(request,response){
        
        
        
    });
    
    return router;
}

module["exports"] = new HomeController();