/** Auth checker for HTTP API */

var _ = require('lodash');
var async = require('async');

var Const = require("./consts");
var Config = require("./init");
var DatabaseManager = require('./DatabaseManager');
var Utils = require('./utils');

var apikeyModel = require('../Models/APIKey.js').get();
var organizationModel = require('../Models/Organization.js').get();

function checkAPIKey(request, response, next) {
    
    var apikey = request.headers['apikey'];

    if(!apikey){
        
        response.status(401).send('Wront API Key');
        
        return;
    }

    async.waterfall([(done) => {

        var result = {};

        apikeyModel.findOne({
            "key":apikey
        },function(err,findResult){
            
            if(_.isEmpty(findResult)){

                response.status(401).send('Wront API Key');
                return;

            }
            
            result.apikey = findResult;
            
            done(err,result);
            
        });
        
    },
    (result,done) => {

        organizationModel.findOne({
            _id: result.apikey.organizationId,
            status:1
        },{
            _id:true,
            organizationId:true,
            name:true,
            craeted:true,
            status:true
        },(err,findResult) => {

            if(_.isEmpty(findResult)){
                response.status(401).send('Wront API Key');
                return;
            }

            result.organization = findResult;

            done(err,result);

        });

    }],
    (err,result) => {

        if(err){
            response.status(500).send('Server Error');
            return;
        }

        request.organization = result.organization;

        next();

    });

}

module.exports = checkAPIKey;