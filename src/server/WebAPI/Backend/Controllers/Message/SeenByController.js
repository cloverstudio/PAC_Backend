/**  Called for /api/v2/test API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');


var pathTop = "../../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var DatabaseManager = require( pathTop + 'lib/DatabaseManager');
var Utils = require( pathTop + 'lib/utils');

var MessageModel = require( pathTop + 'Models/Message');
var UserModel = require( pathTop + 'Models/User');

var BackendBase = require('../BackendBase');

var SeenByController = function(){
}

_.extend(SeenByController.prototype,BackendBase.prototype);

SeenByController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v2/message/seenby/messageid Get list of users who've seen the message
     * @apiName Get SeenBy
     * @apiGroup WebAPI
     * @apiDescription Returns array of user model
     **/

    router.get('/:messageid',function(request,response){

        var messageId = request.params.messageid;
        var messageModel = MessageModel.get();
        var userModel = UserModel.get();

        if(!Utils.isObjectId(messageId)){
            self.successResponse(response,Const.responsecodeForwardMessageInvalidChatId);
            return;
        }

        async.waterfall([(done) => {
            
            var result = {};

            messageModel.findOne({_id:messageId},(err,findResult) => {

                if(!findResult){
                    self.successResponse(response,Const.responsecodeForwardMessageInvalidChatId);
                    return;
                }

                result.message = findResult;
                result.seebBy = findResult.seenBy;
                done(err,result);

            });

        },
        (result,done) => {
            
            var seenByUserIds = _.map(result.message.seenBy,(obj) => { return obj.user });

            seenByUserIds = _.uniq(seenByUserIds);
            seenByUserIds = _.filter(seenByUserIds,(str) => { return Utils.isObjectId(str)});

            userModel.find({_id:{$in:seenByUserIds}},
            UserModel.defaultResponseFields,
            (err,findResult) => {
                result.users = findResult;
                done(err,result);
            });

        }],
        (err,result) => {

            if(err){
                console.log("critical err",err);
                self.errorResponse(response,Const.httpCodeServerError);
                return;
            }

            var responseAry = _.map(result.seebBy,function(obj){

                var user = _.find(result.users,(userRow) => {
                    return userRow._id.toString() == obj.user;
                });

                obj.user = user;

                return obj;

            });

            console.log(responseAry);
            
            self.successResponse(response,Const.responsecodeSucceed,{
                seenBy:responseAry
            });

        });

    });

    return router;

}

module["exports"] = new SeenByController();
