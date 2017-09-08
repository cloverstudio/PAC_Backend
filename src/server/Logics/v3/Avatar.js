/** Create Avatar */
const async = require('async');
const _ = require('lodash');
const Const = require("../../lib/consts");
const Utils = require("../../lib/utils");
const Path = require('path');
const easyImg = require('easyimage');

const Avatar = {
    createAvatarData: (avatar, callback) => {
        easyImg.thumbnail({
            src: avatar.path,
            dst: Path.dirname(avatar.path) + "/" + Utils.getRandomString(),
            width: Const.thumbSize,
            height: Const.thumbSize
        }).then(
            (thumbnail) => {
                avatarData = {
                    picture: {
                        originalName: avatar.name,
                        size: avatar.size,
                        mimeType: avatar.type,
                        nameOnServer: Path.basename(avatar.path)
                    },
                    thumbnail: {
                        originalName: avatar.name,
                        size: thumbnail.size,
                        mimeType: thumbnail.type,
                        nameOnServer: thumbnail.name
                    }
                };
                callback(null, avatarData);
            }, (err) => {
                callback(err, null);
            }
        );
    }
};

module["exports"] = Avatar;