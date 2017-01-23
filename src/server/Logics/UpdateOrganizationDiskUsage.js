/**  Update organization disk usage */

var OrganizationModel = require('../Models/Organization');
var async = require("async");

var UpdateOrganizationDiskUsage = {
    
    update: function(organizationId, size, callback) {

        var organizationModel = OrganizationModel.get();

        async.waterfall([

            (done) => {

                organizationModel.findOne({ _id: organizationId }, (err, findResult) => {
                    done(err, findResult);
                });

            },
            (result, done) => {

                if (result.diskUsage) 
                    result.diskUsage += size;
                else
                    result.diskUsage = size;

                result.save((err, saveResult) => {
                    done(err, saveResult);
                });

            }
        ],
        (err, result) => {
            
            if (callback)
                callback(err, result);

        });

    }
};


module["exports"] = UpdateOrganizationDiskUsage;