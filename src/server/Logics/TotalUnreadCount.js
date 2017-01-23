/**  Returns total unread message count */

var _ = require('lodash');
var async = require('async');
var apn = require('apn');
var gcm = require('node-gcm');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var Utils = require("../lib/utils");

var HistoryModel = require('../Models/History');

var TotalUnreadCount = {
    
    get: function(userId,callBack){
        
        var model = HistoryModel.get();
        
        // get total unread number
        model.aggregate([
            { $match: {
                userId: userId
            }},
            {
                $group: {
                    _id: "$userId",
                    count: {$sum: "$unreadCount"}
                }
            }
        ],function(err,countResult){
            
            if(countResult && countResult.length > 0)
            	callBack(err,countResult[0].count);
			else
				callBack(err,0);

        })
        
    }
    
};


module["exports"] = TotalUnreadCount;