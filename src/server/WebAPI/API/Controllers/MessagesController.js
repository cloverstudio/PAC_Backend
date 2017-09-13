/**  Called for /api/v2/test API */

const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const pathTop = "../../../";

const Const = require( pathTop + "lib/consts");
const Config = require( pathTop + "lib/init");
const Utils = require( pathTop + "lib/utils");

const DatabaseManager = require( pathTop + 'lib/DatabaseManager');
const checkAPIKey = require( pathTop + 'lib/authApiV3');
const APIBase = require('./APIBase');

const MessageModel = require(pathTop + 'Models/Message');
const MessageLogic = require( pathTop + "Logics/v3/Message");

const MessagesController = function(){}

_.extend(MessagesController.prototype,APIBase.prototype);

MessagesController.prototype.init = function(app){

    const self = this;

   /**
     * @api {put} /api/v3/messages/:messageId just test
     **/
    router.put('/:messageId', checkAPIKey, (request,response) => {
        const messageId = request.params.messageId;
        const newMessage = request.body.message;
        
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
                messageModel.findOne({_id: messageId}, (err, found) => {
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
                    done(null, null);
                }
            },
            // Validate presence of parameters
            (reuslt, done) => {
                const values = {messageId: messageId, message: newMessage};
                self.validatePresence(values, (err) => {
                    done(err, null);
                });
            }
        ],
        (err, result) => {
            if (!_.isEmpty(err))
                return response.status(err.code).send(err.message);
            
            MessageLogic.update(messageId, newMessage, (updatedRoom) => {
                self.successResponse(response, Const.responsecodeSucceed);
            }, (err) => {
                console.log("Critical Error", err);
                return self.errorResponse(response, Const.httpCodeServerError);
            });
        });
    });

    router.post('/', (request,response) => {

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
