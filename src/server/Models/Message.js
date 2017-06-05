/**  Message Model */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

var Const = require("../lib/consts");
var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');
var Utils = require("../lib/utils");

var BaseModel = require('./BaseModel');
var UserModel = require('./User');

var OldOpenSourceUser = require('./OldOpenSourceUser');

var Message = function(){};

_.extend(Message.prototype,BaseModel.prototype);

Message.prototype.init = function(mongoose){

    // Defining a schema
    this.schema = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, index: true },
        localID: { type: String, index: true },
        userID: { type: String, index: true },
        roomID: { type: String, index: true },
        type: Number,
        message: String,
        image: String,
        remoteIpAddress: String,
        file: {
            file: {
                id: mongoose.Schema.Types.ObjectId,
	            name: String,
	            size: Number,
	            mimeType: String
            },
            thumb: {
                id: mongoose.Schema.Types.ObjectId,
	            name: String,
	            size: Number,
	            mimeType: String
            }
        },
        seenBy:[],
        location: {
	            lat: Number,
	            lng: Number
        },
        deleted: Number,
        created: Number,
        attributes: {}
    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "spika_messages", this.schema);

}

Message.get = function(){

    return DatabaseManager.getModel('Message').model;

}

Message.findOldMessages = function(roomID,lastMessageID,limit,callBack){

    var model = Message.get();

    if(lastMessageID != 0){
        
        var self = this;
        
        model.findOne({ _id: lastMessageID },function (err, message) {

            if (err) return console.error(err);
            
            var lastCreated = message.created;
            
            var query = model.find({
                roomID:roomID,
                created:{$lt:lastCreated}
            }).sort({'created': 'desc'}).limit(limit);        
            
            query.exec(function(err,data){
                
                if (err)
                    console.error(err);
                
                if(callBack)
                    callBack(err,data)
                
            });                
                
        
        });
        
    }else{
        
        var query = model.find({roomID:roomID}).sort({'created': 'desc'}).limit(limit);        
    
        query.exec(function(err,data){
            
            if (err) return console.error(err);
            
            if(callBack)
                callBack(err,data)
            
        });
    
    
    }

}

Message.findNewMessages = function(roomID,lastMessageID,limit,callBack){

    var model = Message.get();

    if(lastMessageID != 0){
        
        var self = this;
        
        model.findOne({ _id: lastMessageID },function (err, message) {

            if (err) return console.error(err);
            
            var lastCreated = message.created;
            
            var query = model.find({
                roomID:roomID,
                created:{$gt:lastCreated}
            }).sort({'created': 'asc'});        
            
            query.exec(function(err,data){
                
                if (err)
                    console.error(err);
                
                if(callBack)
                    callBack(err,data)
                
            });                
                
        
        });
        
    }else{
        
        var query = model.find({roomID:roomID}).sort({'created': 'desc'}).limit(limit);        
    
        query.exec(function(err,data){
            
            if (err) return console.error(err);
            
            // re-sort to be asc
            data = _.sortBy(data,(o) => {
                return o.created;
            });

            if(callBack)
                callBack(err,data)
            
        });
    
    
    }

}

Message.findAllMessages = function(roomID,fromMessageID,callBack){

    var model = Message.get();

    if(fromMessageID != 0){
        
        var self = this;
        
        model.findOne({ _id: fromMessageID },function (err, message) {

            if (err) return console.error(err);
            
            var lastCreated = message.created;
            
            var query = model.find({
                roomID:roomID,
                created:{$gte:lastCreated}
            }).sort({'created': 'asc'});        
            
            query.exec(function(err,data){
                
                if(data.length < Const.pagingLimit){

                    self.findNewMessages(roomID,0,Const.pagingLimit,callBack);

                    return;
                    
                }

                if (err)
                    console.error(err);
                
                if(callBack)
                    callBack(err,data)
                
            });                
                
        
        });
        
    }else{
        
        var query = model.find({roomID:roomID}).sort({'created': 'desc'}).limit(limit);        
    
        query.exec(function(err,data){
            
            if (err) return console.error(err);
            
            // re-sort to be asc
            data = _.sortBy(data,(o) => {
                return o.created;
            });

            if(callBack)
                callBack(err,data)
            
        });
    
    
    }

}



Message.populateMessages = function(messages,callBack){
    
    var model = Message.get();
    var modelUser = UserModel.get();

    if(!_.isArray(messages)){
        
        messages = [messages];
        
    }
    
    // collect ids
    var ids = [];
    var oldIds = [];

    messages.forEach(function(row){

        // get users for seeny too
        _.forEach(row.seenBy,function(row2){

            if(row2.version == 2){
                ids.push(row2.user); 
            }else{
                oldIds.push(row2.user.toString());
            }

        });
        
        ids.push(row.userID); 
        
    });
    
    oldIds = _.uniq(oldIds);

    if(ids.length == 0 && oldIds.length == 0){
        callBack(null,messages);
    }

    async.waterfall([(done) => {

        if(oldIds.length == 0){
            done(null,null);
            return;
        }

        // convert MF olduserid to spika for business user id
        var oldOpenSourceUser = OldOpenSourceUser.get();

        var condition = _.map(oldIds,(value) => { return {user:value} } );

        var query = model.find({
            $or : condition
        }).sort({'created': 1}).limit(500).exec((err,data) => {    
            
            var convTable = {};

            if (err){
                done(null,null);
                return;
            }

            data.forEach((messageObj) => {
                ids.push(messageObj.userID.toString());
                convTable[messageObj.user] = messageObj.userID.toString();
            });

            ids = _.uniq(ids);

            messages.forEach(function(row){
                
                var oldSeenBy = row.seenBy;

                row.seenBy = _.map(row.seenBy,(obj) => {

                    var newUserId = convTable[obj.user.toString()];
                    if(!newUserId){
                        return obj;
                    }else{
                        return {
                            user: newUserId.toString(),
                            at: obj.at,
                            version:2
                        }
                    }


                });

                // update to new seenby
                model.update({ 
                    _id: row._id
                },{ 
                    seenBy: row.seenBy
                },(err,updateResult) => {
                    if(err)
                        console.log(err);
                });

            });

            done(null,null);

        }); 

    },function(result,done){

        var resultAry = [];

        UserModel.findUsersbyId(ids,function(err,userResult){
            
            _.forEach(messages,function(messageElement,messageIndex,messagesEntity){
                
                var obj = messageElement.toObject();
                
                _.forEach(userResult,function(userElement,userIndex){
                    
                    // replace user to userObj
                    if(messageElement.userID.toString() == userElement._id.toString()){
                        obj.user = userElement.toObject();
                    }

                }); 
                
                var seenByAry = [];
                
                // replace seenby.user to userObj
                _.forEach(messageElement.seenBy,function(seenByRow){
                    
                    _.forEach(userResult,function(userElement,userIndex){
                        
                        var userId = seenByRow.user;

                        // replace user to userObj
                        if(userId == userElement._id.toString()){
                            
                            seenByAry.push({
                                userID:userId,
                                user:userElement,
                                at:seenByRow.at 
                            });
                            
                        }

                    });
                                                    
                });

                obj.seenBy = seenByAry;
                    
                resultAry.push(obj);
                
            });
            
            done(null,resultAry)           
            
                                
        });
                    
    }],
    function(err,resultAry){

        callBack(err,resultAry);

    });
}


module["exports"] = Message;
