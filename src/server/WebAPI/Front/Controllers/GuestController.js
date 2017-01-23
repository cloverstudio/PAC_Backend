/** Called for URL /guest */

var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var path = require('path');
var _ = require('lodash');
var JSON = require('JSON2');
var async = require('async');

var Const = require("../../../lib/consts");
var Config = require("../../../lib/init");
var BackendBaseController = require("./BackendBaseController");
var DatabaseManager = require('../../../lib/DatabaseManager');
var Utils = require('../../../lib/utils');

var OrganizationModel = require('../../../Models/Organization');
var UserModel = require('../../../Models/User');

var NewOrganizationLogic = require('../../../Logics/NewOrganization');
var NewUserLogic = require('../../../Logics/NewUser');

var GuestController = function(){
}

// extends from basecontroller
_.extend(GuestController.prototype,BackendBaseController.prototype);

GuestController.prototype.init = function(app){
    
    var self = this;

    router.get('/:userIdentifier', (request, response) => {
        
        var userIdentifier = request.params.userIdentifier;
        var splitted = userIdentifier.split("@");
        
        if(!_.isArray(splitted) || splitted.length < 2){
            response.redirect('/404');
            return;
        }
        
        var userId = splitted[0];
        var organizationId = splitted[1];
        
        var userModel = UserModel.get();
        var organiztionModel = OrganizationModel.get();
        
        async.waterfall([
            
            (done) => {
                
                var result = {};

                organiztionModel.findOne({organizationId:organizationId},(err,organizationFindResult) => {
                    
                    result.organization = organizationFindResult;
                    
                    done(err,result);
                    
                });

            },
            
            (result,done) => {
                
                if(result.organization){
                    
                    userModel.findOne({
                        userid:userId,
                        organizationId:result.organization._id
                    },(err,userFindResult) => {
                        
                        result.user = userFindResult;
                        
                        done(err,result);
                        
                    });
                
                } else {
                    
                    done(err,result);
                    
                }

                
            }
            
        ],
        (err,result) => {
            
            if(err){
                response.redirect('/404');
                return;
            }
            
            if(!result.user || !result.organization){
                response.redirect('/404');
                return;
            }
            
            self.renderSignup(request, response, '/Guest/index', { 
                user: result.user,
                organization: result.organization
            });
            
        });
        

    });

    return router;
}

module["exports"] = new GuestController();