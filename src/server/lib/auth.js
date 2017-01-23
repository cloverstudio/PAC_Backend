/** Auth checker for Admin and Owner CMS */
var _ = require('lodash');

var Const = require("./consts");
var DatabaseManager = require('./DatabaseManager');

function checkUserOwner(request, response, next) {

    if (!request.session.superAdmin) {
        response.redirect('/owner/signin?originalUrl=' + request.originalUrl);
    } else {
        next();
    }
    
}

function checkUserAdmin(request, response, next) {

    if (!request.session.user) {
        response.redirect('/admin/signin?originalUrl=' + request.originalUrl);
    } else {

        DatabaseManager.redisGet(Const.adminForcelogoutList,function(err,value){
            
            var find = _.find(value,(o) => {

                return o.userId == request.session.user.userid &&
                    o.organizationId == request.session.user.organizationId

            });

            var newList = _.filter(value,(o) => {

                return o.userId != request.session.user.userid ||
                    o.organizationId != request.session.user.organizationId

            });

            DatabaseManager.redisSave(Const.adminForcelogoutList,newList);

            if(find){
                response.redirect('/admin/signout');
            }else{
                next();
            }

            
        });

    }

}

module.exports.checkUserOwner = checkUserOwner;
module.exports.checkUserAdmin = checkUserAdmin;