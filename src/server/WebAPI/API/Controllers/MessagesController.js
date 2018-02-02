/**  Called for /api/v2/test API */

const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const pathTop = "../../../";

const Const = require(pathTop + "lib/consts");
const Config = require(pathTop + "lib/init");
const Utils = require(pathTop + "lib/utils");

const DatabaseManager = require(pathTop + 'lib/DatabaseManager');
const checkAPIKey = require(pathTop + 'lib/authApiV3');
const APIBase = require('./APIBase');

const UserModel = require(pathTop + 'Models/User');
const MessageModel = require(pathTop + 'Models/Message');
const MessageLogic = require(pathTop + "Logics/v3/Message");
const SendMessageLogic = require(pathTop + "Logics/v3/SendMessage");
const EncryptionManager = require(pathTop + 'lib/EncryptionManager');

const MessagesController = function () { }

_.extend(MessagesController.prototype, APIBase.prototype);

MessagesController.prototype.init = function (app) {

    const self = this;

    /**
     * @api {post} /api/v3/messages send messsage
     **/
    router.post('/', checkAPIKey, (request, response) => {

        var targetType = request.body.targetType;
        var target = request.body.target;
        var messageType = request.body.messageType;
        var message = request.body.message;
        var file = request.body.file;
        var localId = request.body.localID;

        var userModel = UserModel.get();

        if (!targetType) {
            response.status(Const.httpCodeBadParameter).send('Bad Parameter');
            return;
        }

        if (!target) {
            response.status(Const.httpCodeBadParameter).send('Bad Parameter');
            return;
        }

        if (!messageType) {
            response.status(Const.httpCodeBadParameter).send('Bad Parameter');
            return;
        }

        if (messageType == Const.messageTypeText && !message) {
            response.status(Const.httpCodeBadParameter).send('Bad Parameter');
            return;
        }

        if (messageType == Const.messageTypeFile && !file) {
            response.status(Const.httpCodeBadParameter).send('Bad Parameter');
            return;
        }

        var roomId = targetType + "-" + target;

        async.waterfall([(done) => {

            var result = {};
            if (targetType != Const.chatTypePrivate) {
                done(null, result);
                return;
            }
            // find user
            userModel.findOne({
                userid: target,
                organizationId: request.user.organizationId
            }, (err, findResult) => {

                if (!findResult) {

                    done({
                        status: Const.httpCodeBadParameter,
                        message: Const.errorMessage.userNotExistInOrganization
                    }, null);

                    return;
                }

                roomId = Utils.chatIdByUser(findResult, request.user);

                done(null, result);

            });

        }],
            (err, result) => {
                if (err) {
                    if (err.status && err.message)
                        response.status(err.status).send(err.message);
                    else
                        response.status(500).send("Server Error");
                    return;
                }

                const params = {
                    userID: request.user._id,
                    roomID: roomId,
                    localID: localId,
                    message: message,
                    plainTextMessage: true,
                    type: messageType,
                    file: file
                };

                SendMessageLogic.send(params, (err) => {
                    console.log("Critical Error", err);
                    return self.errorResponse(response, Const.httpCodeServerError);
                }, (message) => {
                    const messageData = {
                        "id": message._id,
                        "message": message.message,
                        "roomID": message.roomID,
                        "created": message.created
                    };
                    const userData = {
                        "id": request.user._id,
                        "name": request.user.name,
                        "avatar": request.user.avatar,
                        "description": request.user.description,
                        "organizationId": request.user.organizationId,
                        "sortName": request.user.sortName,
                        "userid": request.user.userid,
                        "created": request.user.created
                    };
                    self.successResponse(response, Const.responsecodeSucceed,
                        { "message": messageData, "user": userData }
                    );
                }
                );
            });
    });

    /**
      * @api {put} /api/v3/messages/:messageId just test
      **/
    router.put('/:messageId', checkAPIKey, (request, response) => {
        const messageId = request.params.messageId;
        const newMessageText = request.body.message;

        async.waterfall([
            (done) => {
                if (!mongoose.Types.ObjectId.isValid(messageId)) {
                    done({
                        code: Const.httpCodeBadParameter,
                        message: Const.errorMessage.messageidIsWrong
                    }, null);
                } else {
                    done(null, null);
                }
            },
            // get message model
            (result, done) => {
                const messageModel = MessageModel.get();
                messageModel.findOne({ _id: messageId }, (err, found) => {
                    if (!found) {
                        return done({
                            code: Const.httpCodeBadParameter,
                            message: Const.errorMessage.messageNotExist
                        }, null);
                    }
                    done(err, found);
                });
            },
            // Validate sender
            (oldMessage, done) => {
                if (oldMessage.user.toString() != request.user._id) {
                    done({
                        code: Const.httpCodeForbidden,
                        message: Const.errorMessage.cannotUpdateMessage
                    }, null);
                } else {
                    done(null, oldMessage);
                }
            },
            // Validate presence of parameters
            (oldMessage, done) => {
                const values = { messageId: messageId, message: newMessageText };
                self.validatePresence(values, (err) => {
                    done(err, oldMessage);
                });
            }
        ],
            (err, oldMessage) => {
                if (!_.isEmpty(err))
                    return response.status(err.code).send(err.message);

                MessageLogic.update(oldMessage, newMessageText, (updatedRoom) => {
                    self.successResponse(response, Const.responsecodeSucceed);
                }, (err) => {
                    console.log("Critical Error", err);
                    return self.errorResponse(response, Const.httpCodeServerError);
                });
            });
    });

    router.delete('/:messageId', checkAPIKey, (request, response) => {
        const messageId = request.params.messageId;

        async.waterfall([
            (done) => {
                if (!mongoose.Types.ObjectId.isValid(messageId)) {
                    done({
                        code: Const.httpCodeBadParameter,
                        message: Const.errorMessage.messageidIsWrong
                    }, null);
                } else {
                    done(null, null);
                }
            },
            // get room which should be deleted
            (result, done) => {
                const messageModel = MessageModel.get();
                messageModel.findOne({ _id: messageId }, (err, found) => {
                    if (!found) {
                        return done({
                            code: Const.httpCodeBadParameter,
                            message: Const.errorMessage.messageNotExist
                        }, null);
                    }
                    done(err, found);
                });
            },
            // Validate sender
            (oldMessage, done) => {
                if (oldMessage.user.toString() != request.user._id) {
                    done({
                        code: Const.httpCodeForbidden,
                        message: Const.errorMessage.cannotDeleteMessage
                    }, null);
                } else {
                    done(null, oldMessage);
                }
            }
        ],
            (err, oldMessage) => {
                if (!_.isEmpty(err))
                    return response.status(err.code).send(err.message);

                MessageLogic.delete(oldMessage, (updatedRoom) => {
                    self.successResponse(response, Const.responsecodeSucceed);
                }, (err) => {
                    console.log("Critical Error", err);
                    return self.errorResponse(response, Const.httpCodeServerError);
                });
            })
    });

    return router;
}

MessagesController.prototype.validatePresence = (values, callback) => {
    let error = {};
    if (!values.messageId) {
        error.message = Const.errorMessage.messageidIsWrong
    } else if (!values.message) {
        error.message = Const.errorMessage.messageIsEmpty
    }

    if (error.message) {
        error.code = Const.httpCodeBadParameter;
    } else {
        error = null;
    }
    callback(error);
}

module["exports"] = new MessagesController();
