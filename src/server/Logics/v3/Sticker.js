/** Create Sticker */
const async = require('async');
const _ = require('lodash');
const Const = require("../../lib/consts");
const Utils = require("../../lib/utils");
const Path = require('path');
const easyImg = require('easyimage');
const StickerModel = require('../../Models/Sticker');
const OrganizationModel = require('../../Models/Organization');
const PermissionLogic = require('./Permission');

const Sticker = {
    getList: (baseUser, params, onSuccess, onError) => {
        const stickerModel = StickerModel.get();
        const organizationModel = OrganizationModel.get();
        const organizationId = baseUser.organizationId;
        
        async.waterfall([
            (done) => {
                organizationModel.findOne({ _id:organizationId }, (err, organization) => {
                    if (!organization)
                        return done({code: err.status, message: err.text}, null);
                    done(err, organization);
                });
            },
            (organization, done) => {
                const condition = {
                    $or: [
                        {organizationId: organizationId},
                        {organizationId: {$exists: false}}
                    ]
                };
                const query = stickerModel.find(condition, params.fields)
                .skip(params.offset)
                .sort(params.sort)
                .limit(params.limit);
                
                query.exec((err, stickers) => {
                    const list = Utils.ApiV3StyleId(stickers);
                    done(err, list)
                });
            },
            // Change array structure to be more general
            (stickers, done) => {
                const basePath = '/api/v3/sticker/';
                const newStickers = _.map(stickers, (sticker) => {
                    let titleThumb = "";
                    const newlist = _.map(sticker.pictures, (picture) => {
                        if (picture.main)
                            titleThumb = basePath + picture.thumbnail.nameOnServer;
                        return {
                            fullPic: basePath + picture.picture.nameOnServer,
                            smallPic: basePath + picture.thumbnail.nameOnServer
                        }
                    });
                    return {
                        name: sticker.name,
                        list: newlist,
                        mainTitlePic: titleThumb
                    }
                });
                done(null, newStickers);
            }
        ],
        (err, stickers) => {
            if (err && onError) return onError(err);
            if (onSuccess) onSuccess(stickers);
        });
    }
};

module["exports"] = Sticker;