var _ = require('lodash');
var express = require('express');
var router = express.Router();

var pathTop = "../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var Utils = require( pathTop + "lib/utils");

var checkAPIKey = require( pathTop + 'lib/authApiV3');
var APIBase = require('./APIBase');

var SearchGroupLogic = require( pathTop + "Logics/v3/SearchGroup");

var GroupsController = function(){};

_.extend(GroupsController.prototype, APIBase.prototype);

GroupsController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v3/groups/ get group list
     **/

    router.get('/',checkAPIKey, (request,response) => {
        
        var keyword = "", 
            offset = 0, 
            limit = 0,
            sort = {}, 
            fields = {};
        
        if (request.query.keyword) {
            keyword = request.query.keyword;
        }

        if (request.query.offset) {
            if (request.query.offset < 0) 
                return response.status(422).send('Bad Parameter');
            offset = request.query.offset;
        }

        if (request.query.limit) {
            limit = request.query.limit;
        }

        if (request.query.sort) {
            var sortCondtions = request.query.sort.split(",");
            _.each(sortCondtions,(condition) => {
                var splited = [];
                if (_.contains(condition, ":")) {
                    splited = condition.trim().split(":");
                    switch (splited[1].trim()) {
                        case 'desc':
                            splited[1] = -1;            
                            break;
                        default:
                            splited[1] = 1;
                    }
                    sort[splited[0]] = splited[1];
                }
            });
        }

        if (request.query.fields) {
            var splitFields = request.query.fields.split(",");    
            _.each(splitFields, (key) => {
                fields[key.trim()] = 1;
            });
        }

        SearchGroupLogic.search(request.user, keyword, offset, limit, sort, fields, (result, err) => {
            self.successResponse(response, Const.responsecodeSucceed, {
                groups: result.list
            });
        }, (err) => {
            console.log("Critical Error", err);
            self.errorResponse(response, Const.httpCodeServerError);
            return;
        });
    });

    return router;
}

module["exports"] = new GroupsController();
