const _ = require('lodash');
const async = require('async');
const Const = require("../../lib/consts");
const Utils = require("../../lib/utils");

const UpdateHistoryV2 = require('../UpdateHistory');

const UpdateHistory = {};

_.extend(UpdateHistory, UpdateHistoryV2);

UpdateHistory.newRoom = (roomObj) => {        

    if(_.isEmpty(roomObj.users) || _.isEmpty(roomObj.id))
        return;
        
    async.each(roomObj.users, (userId,done) => {
        var historyData = {
            userId : userId,
            chatId : roomObj.id,
            chatType : Const.chatTypeRoom,
            lastUpdate : Utils.now(),
            lastUpdateUser : null,
            lastMessage : null
        };
        UpdateHistory.updateData(historyData, null, (err,updateResult) => {
            done(null);
        });
    }, (err) => {
    });
}

module["exports"] = UpdateHistory;