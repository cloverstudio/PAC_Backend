/** Create Message */
const async = require('async');
const _ = require('lodash');
const Const = require("../../lib/consts");
const Utils = require("../../lib/utils");
const Path = require('path');
const easyImg = require('easyimage');
const MessageModel = require('../../Models/Message');
const SocketAPIHandler = require('../../SocketAPI/SocketAPIHandler');

const Message = {
    update: (messageId, newMessage, onSuccess, onError) => {
        const messageModel = MessageModel.get(); 
        messageModel.update({ _id: messageId }, {message: newMessage}, (err, updated) => {
            if(err && onError) return onError(err);
            if(onSuccess) onSuccess(null);
        });
    },
};

module["exports"] = Message;