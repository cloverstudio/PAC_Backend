/** Auth checker for Admin and Owner CMS */
const _ = require('lodash');

const Const = require("./consts");
const DatabaseManager = require('./DatabaseManager');

checkUserAdmin = (request, response, next) => {
    const userModel = require('../Models/User').get();    
    const token = request.headers['access-token'];

    userModel.findOne({
        token: {$elemMatch: {token: token}}
    }, (err, findResult) => {
        if (err || _.isEmpty(findResult) || findResult.permission !== Const.userPermission.organizationAdmin) {
            return response.status(403).send("Permission Error: You are not Admin");   
        } else {
            return next();            
        }
    });
}

module.exports.checkUserAdmin = checkUserAdmin;