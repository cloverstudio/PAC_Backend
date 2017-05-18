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
        

            data.forEach((o) => {
                console.log(o.message,o.created);    
            });

            // re-sort to be asc
            data = _.sortBy(data,(o) => {
                return o.created;
            });

            console.log("-------");

            data.forEach((o) => {
                console.log(o.message,o.created);    
            });

            if(callBack)
                callBack(err,data)
            
        });
    
    
    }

}


Message.populateMessages = function(messages,callBack){
    
    var modelUser = UserModel.get();

    if(!_.isArray(messages)){
        
        messages = [messages];
        
    }
    
    // collect ids
    var ids = [];
    
    messages.forEach(function(row){
        
        // get users for seeny too
        _.forEach(row.seenBy,function(row2){
            ids.push(row2.user); 
        });
        
        ids.push(row.user); 
        
    });
    
    if(ids.length > 0){
    
        UserModel.findUsersbyId(ids,function(err,userResult){
            
            var resultAry = [];
            
            _.forEach(messages,function(messageElement,messageIndex,messagesEntity){
                
                var obj = messageElement.toObject();
                
                _.forEach(userResult,function(userElement,userIndex){
                    
                    // replace user to userObj
                    if(messageElement.user.toString() == userElement._id.toString()){
                        obj.user = userElement.toObject();
                    }

                }); 
                
                var seenByAry = [];
                
                // replace seenby.user to userObj
                _.forEach(messageElement.seenBy,function(seenByRow){
                    
                    _.forEach(userResult,function(userElement,userIndex){
                        
                        // replace user to userObj
                        if(seenByRow.user.toString() == userElement._id.toString()){
                            
                            seenByAry.push({
                                user:userElement,
                                at:seenByRow.at 
                            });
                            
                        }

                    });
                                                    
                });
                
                obj.seenBy = seenByAry;
                    
                resultAry.push(obj);
                
            });
            
                              
            callBack(err,resultAry);
                                   
        });
        
    }else{
        callBack(null,messages);
    }
    
}


module["exports"] = Message;
