/** Create Message */
const async = require('async');
const _ = require('lodash');
const Const = require("../../lib/consts");
const Utils = require("../../lib/utils");
const Path = require('path');
const easyImg = require('easyimage');
const MessageModel = require('../../Models/Message');
const HistoryModel = require("../../Models/History");
const NotifyUpdateMessageLogic = require("./NotifyUpdateMessage");
const SocketAPIHandler = require('../../SocketAPI/SocketAPIHandler');

const Message = {
    update: (oldMessage, newMessage, onSuccess, onError) => {
        const messageModel = MessageModel.get(); 
        async.waterfall([
            (done) => {
                messageModel.update({ _id: oldMessage._id }, {message: newMessage}, (err, updated) => {
                    if (err) return done({code: err.status, message: err.text}, null);
                    done(null, null);
                });
            },
            // Populate Message
            (result, done) => {
                MessageModel.populateMessages(oldMessage, (err, messages) => {
                    if (err) return done({ code: err.status, message: err.text}, null);
                    if (messages.length > 0) {
                        let obj = messages[0];
                        obj.message = newMessage;
                        NotifyUpdateMessageLogic.notify(obj);                        
                    }
                    done(null, null);
                });
            }
        ],
        (err, result) => {
            if(err && onError) return onError(err);
            if(onSuccess) onSuccess(null);
        });
    },
    delete: (message, onSuccess, onError) => {
        const messageModel = MessageModel.get();
        const historyModel = HistoryModel.get();

        async.waterfall([
            // Get history
            (done) => {
                historyModel.find({"lastMessage.messageId": message._id.toString()}, (err, foundHistory) => {
                    done(err, foundHistory);
                });
            },
            // Update history
            (foundHistory, done) => {
                foundHistory.forEach((model) => {
                    historyModel.update({_id: model._id}, {lastMessage: null, lastUpdate: Utils.now()});
                });
                done(null, null);
            },
            // Update message
            (result, done) => {
                const updateParams = {
                    message: '', 
                    file: null,
                    location: null,
                    deleted: Utils.now()
                };
                messageModel.update({ _id: message._id}, updateParams, (err, updated) => {
                    if (err) return done({ code: err.status, message: err.text}, null);
                    done(null, null);
                });
            },
            // Populate Message
            (result, done) => {
                MessageModel.populateMessages(message, (err, messages) => {
                    if (err) return done({ code: err.status, message: err.text}, null);
                    if (messages.length > 0) {
                        let obj = messages[0];
                        obj.deleted = Utils.now();
                        obj.message = '';
                        obj.file = null;
                        obj.location = null;
                        NotifyUpdateMessageLogic.notify(obj);                        
                    }
                    done(null, null);
                });
            }
        ],
        (err, result) => {
            if(err && onError) return onError(err);
            if(onSuccess) onSuccess();
        });
    }
};

module["exports"] = Message;