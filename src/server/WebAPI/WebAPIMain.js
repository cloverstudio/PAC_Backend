/** Called for initialization here is initialized all web api  */

var bodyParser = require("body-parser");
var express = require('express');
var exphbs  = require('express-handlebars');
var router = express.Router();
var fs = require('fs')
var session = require('express-session')
var RedisStore = require('connect-redis')(session);
var cookieParser = require('cookie-parser')
var geoip = require('geoip-lite');
var bodyParser = require("body-parser");
var _ = require('lodash');

var init = require('../lib/init.js');
var Const = require('../lib/consts.js');
var auth = require('../lib/auth.js');
var Utils = require('../lib/utils');

var WebAPIMain = {

    init: function(app) {

        var self = this;

        // Initialize template engine
        app.set('views', 'src/server/WebAPI');

        var hbs = exphbs.create({
            // Specify helpers which are only registered on this instance.
            helpers: require('../lib/viewHelpers'),
            layoutsDir: 'src/server/WebAPI',
            extname: '.hbs',
            partialsDir: [
                'src/server/WebAPI/SuperAdmin/Views/Partials'
            ]
        });

        app.engine('.hbs', hbs.engine);
        app.set('view engine', '.hbs');

        app.use('/',express.static(__dirname + '/../../../public'));
        app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({
		  extended: true
		}));
        
        app.use(cookieParser());
        
        app.use(session({
            genid: function(req) {
                return Utils.getRandomString(32)
            },
            secret: Const.sessionsalt,
            store: new RedisStore(init.redis),
            resave: true,
            saveUninitialized: true,
            cookie: { path: '/', httpOnly: false, secure: false, maxAge: null }
        }));

        app.use(function(request, response, next) {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, access-token, apikey");
        next();
        });

        app.all('*', function(request, response, next) {
            
            if(request.cookies.lang){
                
                next();
                
            }else{
                
                var ip = request.headers['x-forwarded-for'] || 
                    request.connection.remoteAddress || 
                    request.socket.remoteAddress ||
                    request.connection.socket.remoteAddress;
                                
                var geo = geoip.lookup(ip);
                
                if(geo && geo.country){
                    
                    response.cookie('lang', geo.country.toLowerCase());
                    
                }else{
                    
                    response.cookie('lang', 'en');
                    
                }

                next();
                
            }

        });

        app.all('/', function(request, response, next) {
              
        });

        app.all('/admin', function(request, response){
            response.redirect('/admin/home');          
        });

        app.all('/owner', function(request, response){
            response.redirect('/owner/home');
        });
        
        router.use("/", require("./Front/FrontMain").init(app));
        router.use("/admin", require("./OrganizationAdmin/OrganizationAdminMain").init(app));
        router.use("/owner", require("./SuperAdmin/SuperAdminMain").init(app));
        router.use("/api/v2", require("./Backend/BackendMain").init(app));
        router.use("/api/v3", require("./API/APIMain").init(app));
        app.use(init.urlPrefix, router);

    }
}

module["exports"] = WebAPIMain;
