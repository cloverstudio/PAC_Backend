/**  Initialize super admin CMS */

var express = require('express');
var router = express.Router();
var fs = require('fs')

var bodyParser = require("body-parser");
var _ = require('lodash');

var init = require('../../lib/init.js');

var OrganizationAdminMain = {

    init: function(app) {

        var self = this;
    
        router.use("/signin", require("./Controllers/SigninController").init(app));
        router.use("/home", require("./Controllers/HomeController").init(app));
        router.use("/organization", require("./Controllers/OrganizationsController").init(app));
        router.use("/sticker", require("./Controllers/StickerController").init(app));
        router.use("/signout", require("./Controllers/SignoutController").init(app));

        router.get('/file', function(request, response){
            
            var filePath = init.publicPath + "/assets/admin/images/nogroup.png";
            response.sendFile(filePath);
                            
        });
        
        router.get('/file/:fileID', function(request, response){
            
            var fileID = request.params.fileID;
            var filePath = init.uploadPath + "/" + fileID;
            
            fs.exists(filePath, function (exists) {
                
                if(!exists){
                    
                    filePath = init.publicPath + "/assets/admin/images/nogroup.png";
                    response.sendFile(filePath);
                    
                } else {
                    
                    response.sendFile(filePath);
                    
                }
                
            });                  
            
        });

        return router;
    }
}

module["exports"] = OrganizationAdminMain;
