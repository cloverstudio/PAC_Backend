/** Initialize backend API controllers here  */

var express = require('express');
var router = express.Router();
var fs = require('fs')

var bodyParser = require("body-parser");
var _ = require('lodash');

var init = require('../../lib/init.js');

var APIMain ={

    init: function(app){

        var self = this;
        
        router.use("/test", require("./Controllers/TestController").init(app));
        router.use("/user/signin", require("./Controllers/SigninController").init(app));
        router.use("/message/send", require("./Controllers/SendMessageController").init(app));
        router.use("/file/upload", require("./Controllers/FileUploadController").init(app));
        router.use("/file/download", require("./Controllers/FileDownloadController").init(app));
        
        return router;
    }
}

module["exports"] = APIMain;
