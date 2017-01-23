/** Base controller for service admin CMS  */

var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');
var JSON = require('JSON2');

var Const = require("../../../lib/consts");
var Config = require("../../../lib/init");
var DatabaseManager = require('../../../lib/DatabaseManager');
var BaseController = require("../../BaseController");

var BackendBaseController = function(){
    
}

_.extend(BackendBaseController.prototype,BaseController.prototype);
BackendBaseController.prototype.loginUser = null;

BackendBaseController.prototype.ViewTop = "SuperAdmin/Views";

BackendBaseController.prototype.renderLogin = function(request,response,template,params){
    
    var lang = request.cookies.lang;
    if(!lang)
        lang = 'en';
        
    var defaultParameters = {
        lang: lang,
        Config:Config,
        AssetURL:"/assets/admin",
        layout: this.ViewTop + "/Login/SigninLayout"
    };
    
    var templateParams = _.assign(defaultParameters,params);
    
	response.render(this.ViewTop + template,templateParams);
    
}

BackendBaseController.prototype.render = function(request,response,template,params){
    
    var lang = request.cookies.lang;
    if(!lang)
        lang = 'en';

    var defaultParameters = {
        lang: lang,
        Config:Config,
        AssetURL:"/assets/admin",
        layout: this.ViewTop + "/DefaultLayout"
    };
    
    var templateParams = _.assign(defaultParameters,params);
    
	response.render(this.ViewTop + template,templateParams);
    
}

module["exports"] = BackendBaseController;