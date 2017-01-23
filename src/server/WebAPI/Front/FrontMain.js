/** Initialize fontend part,  */

var express = require('express');
var router = express.Router();
var fs = require('fs')

var bodyParser = require("body-parser");
var _ = require('lodash');

var init = require('../../lib/init.js');

var SignupMain = {

    init: function(app) {

        var self = this;
    
        router.use("/signup", require("./Controllers/SignupController").init(app));        
        router.use("/404", require("./Controllers/NotFoundController").init(app));  
        
        router.use("/guest", require("./Controllers/GuestController").init(app));    
        
        return router;
    }
}

module["exports"] = SignupMain;
