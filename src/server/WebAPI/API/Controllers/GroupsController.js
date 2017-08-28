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

        const q = self.checkQueries(request.query);
        if (!q) return response.status(422).send("Bad Parameters");

        SearchGroupLogic.search(request.user, q['keyword'], q['offset'], q['limit'], q['sort'], q['fields'], (result, err) => {
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
