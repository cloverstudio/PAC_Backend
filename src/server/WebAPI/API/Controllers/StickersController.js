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

const StickerModel = require(pathTop + 'Models/Sticker');
const StickerLogic = require( pathTop + "Logics/v3/Sticker");


const StickersController = function(){};
_.extend(StickersController.prototype, APIBase.prototype);

StickersController.prototype.init = function(app){
        
    var self = this;

    /**
     * @api {get} /api/v3/stickers/ get sticker list
     **/
    router.get('/', checkAPIKey, (request,response) => {
        const query = self.checkQueries(request.query);
        if (!query) 
            return response.status(Const.httpCodeBadParameter)
                        .send(Const.errorMessage.queryParamsNotCorrect);

        StickerLogic.getList(request.user, query, (stickers, err) => {
            self.successResponse(response, Const.responsecodeSucceed, {
                stickers: stickers
            }); 
        }, (err) => {
            console.log("Critical Error", err);
            return self.errorResponse(response, Const.httpCodeServerError);
        });
    });

    /**
     * @api {get} /api/v3/stickers/{stickerId} get sticker details
     **/
    router.get('/:stickerId', checkAPIKey, (request,response) => {
        const stickerId = request.params.stickerId;        
        const query = self.checkQueries(request.query);

        // Check params
        if (!mongoose.Types.ObjectId.isValid(stickerId))
            return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.stickeridIsWrong);
        if (!query) 
            return response.status(Const.httpCodeBadParameter).send(Const.errorMessage.queryParamsNotCorrect);
        
        StickerLogic.getDetails(StickerId ,query.fields, (Sticker, err) => {
            self.successResponse(response, Const.responsecodeSucceed, {
                Sticker: Sticker
            }); 
        }, (err) => {
            console.log("Critical Error", err);
            return self.errorResponse(response, Const.httpCodeServerError);
        });
    });

    return router;
}

module["exports"] = new StickersController();
