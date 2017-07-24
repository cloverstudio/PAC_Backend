/**  Called for /api/v2/test API */

var _ = require('lodash');
var express = require('express');
var router = express.Router();

var pathTop = "../../../";

var Const = require( pathTop + "lib/consts");
var Config = require( pathTop + "lib/init");
var Utils = require( pathTop + "lib/utils");

var checkAPIKey = require( pathTop + 'lib/authApiV3');
var APIBase = require('./APIBase');

var MessageListLogic = require( pathTop + "Logics/MessageList");

var MessageListController = function(){
}

_.extend(MessageListController.prototype,APIBase.prototype);

MessageListController.prototype.init = function(app){
        
    var self = this;

   /**
     * @api {get} /api/v3/message/list get message list
     **/

    router.get('/:roomID/:lastmessageID/:direction',checkAPIKey,function(request,response){

        var roomID = request.params.roomID;
        var lastmessageID = request.params.lastmessageID;
        var direction = request.params.direction;
        var userID = request.user._id;

        if(!roomID){
            response.status(422).send('Bad Parameter');
            return;
        }

        if(!lastmessageID){
            response.status(422).send('Bad Parameter');
            return;
        }

        if(!userID){
            response.status(422).send('Bad Parameter');
            return;
        }
        
        MessageListLogic.get(userID,roomID,lastmessageID,direction,false,(messages) => {
            self.successResponse(response,Const.responsecodeSucceed,{
                messages:messages
            });
        },(err) => {
            response.status(500).send('Server Error');
            return;
        });


    });

    return router;
}

module["exports"] = new MessageListController();
