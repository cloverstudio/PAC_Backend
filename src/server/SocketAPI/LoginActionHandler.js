/** login Socket API  */

var _ = require('lodash');
var async = require('async');

var DatabaseManager = require("../lib/DatabaseManager");
var SocketConnectionHandler = require("../lib/SocketConnectionHandler");
var SocketAPIHandler = require("./SocketAPIHandler");

var Utils = require("../lib/utils");
var Const = require("../lib/consts");
var Config = require("../lib/init");
var SocketHandlerBase = require("./SocketHandlerBase");

var GroupModel = require('../Models/Group');
var RoomModel = require('../Models/Room');
var UserModel = require('../Models/User');

var LoginActionHandler = function () {

}

_.extend(LoginActionHandler.prototype, SocketHandlerBase.prototype);

LoginActionHandler.prototype.attach = function (io, socket) {

    var self = this;

    /**
     * @api {socket} "login" Login to socket
     * @apiName Login to socket
     * @apiGroup Socket 
     * @apiDescription Login to socket
     * @apiParam {string} token user token
     * @apiParam {string} processId identifier for device
     */
    socket.on('login', function (param) {

        param.socketid = socket.id;


        if (_.isNull(param.processId)) {
            socket.emit('socketerror', { code: Const.responsecodeLoginInvalidParam });
            return;
        }

        // check token
        async.waterfall([function (done) {

            var result = {};

            self.checkToken(param.token, function (checkTokenResult) {

                if (_.isNull(checkTokenResult)) {
                    socket.emit('socketerror', { code: Const.responsecodeSigninInvalidToken });
                    return;
                }

                result.user = checkTokenResult;

                done(null, result)

            });

        },
        function (result, done) {

            // join to self
            socket.join(result.user._id.toString());
            done(null, result);

        },
        function (result, done) {

            // join to groups
            var model = GroupModel.get();

            model.find({
                users: result.user._id.toString()
            }, function (err, groupFindResult) {

                _.forEach(groupFindResult, function (group) {

                    var groupId = group._id.toString();

                    socket.join('2-' + groupId);

                });

                done(null, result);

            });



        },
        function (result, done) {

            // join to rooms
            var model = RoomModel.get();
            model.find({
                users: result.user._id.toString()
            }, function (err, groupFindResult) {

                _.forEach(groupFindResult, function (group) {

                    var roomId = group._id.toString();

                    socket.join('3-' + roomId);

                });

                done(null, result);

            });



        },
        function (result, done) {

            self.handleCalling(socket, result.user.id);
            done(null, result)

        }
        ],
            function (err, result) {

                SocketConnectionHandler.newSocketConnection(
                    result.user,
                    param.processId,
                    socket.id,
                    function () {
                        socket.emit('logined', result);
                    });

            });

    });

}

LoginActionHandler.prototype.handleCalling = function (socket, userId) {

    // check call requeste is exists

    async.waterfall([function (done) {

        var result = {};

        DatabaseManager.redisClient.keys(Const.redisCallQueue + "_" + userId + "_*", function (err, keys) {

            if (!err && keys.length > 0) {

                DatabaseManager.redisGet(keys[0], function (err, value) {

                    if (!err && value) {

                        result.callData = value;
                        done(null, result);

                    } else {

                        done('no data', result);

                    }

                });

            } else {
                done('no data', result);
            }

        });

    }
    ],
        function (err, result) {

            if (!err) {

                _.debounce(function () {

                    SocketAPIHandler.emitToSocket(socket.id, "call_request", {
                        user: result.callData.user,
                        mediaType: result.callData.mediaType
                    });

                }, 1000)();

            }

        });


}

module["exports"] = new LoginActionHandler();