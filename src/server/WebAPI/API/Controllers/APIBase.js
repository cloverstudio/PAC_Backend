/**  Base Controlelr for all Backend API Controllers */

var _ = require('lodash');
var async = require('async');

var pathTop = "../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var Utils = require( pathTop + 'lib/utils');

const formidable = require('formidable');
const path = require('path');

var APIBase = function(){
    
}

var Base = require('../../BaseController');

_.extend(APIBase.prototype,Base.prototype);

APIBase.prototype.errorResponse = (response, httpCode) => {
    response.status(httpCode).send("");
}

APIBase.prototype.successResponse = (response,code,data) => {
    response.status(Const.httpCodeSucceed);
    response.set('connection','Keep-alive');
    response.json(data);
}

APIBase.prototype.checkQueries = (query) => {
    
    let keyword = "", 
    offset = 0, 
    limit = 0,
    sort = {}, 
    fields = {};
    if (query.keyword) {
        keyword = query.keyword;
    }
    if (query.offset) {
        if (query.offset < 0) return;
        offset = query.offset;
    }
    if (query.limit) {
        limit = query.limit;
    }
    if (query.sort) {
        const sortCondtions = query.sort.split(",");
        _.each(sortCondtions,(condition) => {
            let splited = [];
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
    if (query.fields) {
        const splitFields = query.fields.split(",");    
        _.each(splitFields, (key) => {
            fields[key.trim()] = 1;
        });
    }
    return { keyword: keyword, offset: offset, limit: limit, sort: sort, fields: fields };
}

APIBase.prototype.parseFormData = (request, callback) => {
    let form = new formidable.IncomingForm();
    const uploadPathError = APIBase.prototype.checkUploadPath();    
    form.uploadDir = Config.uploadPath;
    form.on('fileBegin', (name, file) => {
        file.path = path.dirname(file.path) + "/" + Utils.getRandomString();
    });
    form.onPart = (part) => {
        if (part.filename) {
            if (!uploadPathError) form.handlePart(part);
        } else if (part.filename != "") {
            form.handlePart(part);
        }
    }
    form.parse(request, (err, fields, files) => {
        const result = { avatar: files.avatar, fields: fields }
        callback(err, result);
    });
}

module["exports"] = APIBase;