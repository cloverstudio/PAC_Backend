const _ = require('lodash');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const async = require('async');

const pathTop = "../../../";
const Const = require( pathTop + "lib/consts");
const Config = require( pathTop + "lib/init");
const Utils = require( pathTop + "lib/utils");
const checkAPIKey = require( pathTop + 'lib/authApiV3');
const APIBase = require('./APIBase');
const checkUserAdmin = require('../../../lib/authV3.js').checkUserAdmin;
const formidable = require('formidable');

const GroupModel = require(pathTop + 'Models/Group');
const UserModel = require(pathTop + 'Models/User');  

const MessageListLogic = require( pathTop + "Logics/v3/MessageList");
const UserLogic = require( pathTop + "Logics/v3/User");

const PrivateMessageController = function(){};
_.extend(PrivateMessageController.prototype, APIBase.prototype);

PrivateMessageController.prototype.init = function(app){
        
    var self = this;

    /**
     * @api {get} /private/{targetUserId}/messages/ Get list of messages sent to private chat
     **/
    router.get('/:targetUserId/messages', checkAPIKey, (request,response) => {
        
        const q = self.checkQueries(request.query);
        const targetUserId = request.params.targetUserId;  

        // Check params
        if (!mongoose.Types.ObjectId.isValid(targetUserId))
            return response.status(Const.httpCodeBadParameter).send("Bad Parameter");
        
        async.waterfall([

            (done) => {

                const userModel = UserModel.get(); 

                const result = {};

                userModel.findOne({
                    _id:targetUserId
                },function(err,findResult){

                    if(!findResult){

                        done({
                            code: Const.httpCodeBadParameter
                        },null);

                        return;
                    }

                    result.userDetail = findResult;
                    done(null,result);
                    
                });

            },
            (result,done) => {

                // get room id
                const chatId = Utils.chatIdByUser(request.user,result.userDetail);

                // find messsages
                MessageListLogic.get(request.user._id
                    ,chatId
                    ,q
                    ,(messages) => {

                    result.messages = messages;
                    done(null,result);

                },(err) => {
                    done(err,result);
                });

            },
            (result,done) => {
                
                done(null,result);

            }
        ],
        (err,result) => {
    
            if(err){

                if(err.code && err.code == Const.httpCodeBadParameter)
                    return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.useridIsWrong);

                self.errorResponse(response, Const.httpCodeServerError);

                return;

            }

            self.successResponse(response, Const.responsecodeSucceed, {
                messages: result.messages
            }); 

        });

    });
        
    return router;
}

module["exports"] = new PrivateMessageController();
