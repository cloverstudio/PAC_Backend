/** Delete all message */

var fs = require('fs-extra');
var _ = require('lodash');
var sha1 = require('sha1');
var http = require('http');
var Stream = require('stream').Transform;
var async = require('async');

var DatabaseManager = require('../server/lib/DatabaseManager');
var UserModel = require('../server/Models/User');

var Utils = require('../server/lib/utils');
var init = require('../server/lib/init');
var Const = require('../server/lib/consts');

var RoomModel = require('../server/Models/Room');

DatabaseManager.init(function (success) {

    if (!success) {

        console.log('Failed to connect DB');
        process.exit(1);

    } else {

        var responseData = {};
        var roomModel = RoomModel.get();
        var userModel = UserModel.get();

        // get all rooms
        async.waterfall([

            function (done) {

                roomModel.find({}, function (err, roomResult) {

                    if (err) {
                        done(err, null);
                        return;
                    }

                    responseData.rooms = roomResult;
                    done(err, responseData);

                });

            },
            function (result, doneWaterFall) {

                responseData.organizationIds = [];

                async.eachLimit(result.rooms, 10, function (room, done) {

                    // search user
                    userModel.findOne({ _id: room.owner }, function (err, userResult) {

                        console.log(room.organizationId == userResult.organizationId)

                        roomModel.update({ _id: room._id }, { organizationId: userResult.organizationId }, function (err, room) {
                            if (err) return handleError(err);
                            done();
                        })

                    });


                }, function (err, result) {

                    doneWaterFall(err, responseData);

                });


            }

        ], function (err, result) {

            if (err) {
                console.log("Ended with errors", err);
                process.exit(1);
            }

            console.log("Ended successfully");
            process.exit(1);

        });

    }

});
