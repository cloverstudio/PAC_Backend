/** Called for /api/v2/message/search/:keyword/:page API */


var express = require('express');
var router = express.Router();
var _ = require('lodash');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var tokenChecker = require(pathTop + 'lib/authApi');
var SearchMessageLogic = require(pathTop + 'Logics/SearchMessage');

var BackendBase = require('../BackendBase');

var SearchMessageController = function () {
}

_.extend(SearchMessageController.prototype, BackendBase.prototype);

SearchMessageController.prototype.init = function (app) {

    var self = this;

    /**
      * @api {get} /api/v2/message/search/:keyword/:page Search Message
      * @apiName Search Message
      * @apiGroup WebAPI
      * @apiDescription Returns messages. [!NOTICE] This API doesn't returns same row count for each page. Stop paging when it returns 0 result. Match target is text message and file name.
      * @apiHeader {String} access-token Users unique access-token.
      * @apiParam {String} keyword URL encoded keyword
      * 
      * @apiSuccessExample Success-Response:
 
 {
     "code": 1,
     "time": 1457362232696,
     "data": {
         "messages": [{
             "_id": "56dd952ef3e5890d4700b9e7",
             "user": "56c32ae5331dd81f8134f201",
             "userID": "56c32acd331dd81f8134f200",
             "roomID": "1-56c32acd331dd81f8134f200-56d963dc4c7b0c89201acde7",
             "message": "zzz",
             "localID": "_QTuVRdVXmmnYL4bM2cOGtWXnYqVQgkUZ",
             "type": 1,
             "created": 1457362222564,
             "__v": 0,
             "seenBy": [],
             "userModel": {
                 "_id": "56c32acd331dd81f8134f200",
                 "name": "Ken",
                 "sortName": "ken yasue",
                 "description": "ああああ",
                 "userid": "kenyasue",
                 "password": "*****",
                 "created": 1455631053660,
                 "status": 1,
                 "organizationId": "56ab7b9061b760d9eb6feba3",
                 "__v": 0,
                 "tokenGeneratedAt": 1457362225645,
                 "token": "*****",
                 "groups": ["56cf0a60ed51d2905e28a848", "56cf0897ed51d2905e28a726"],
                 "avatar": {
                     "thumbnail": {
                         "originalName": "2015-01-11 21.30.05 HDR.jpg",
                         "size": 1551587,
                         "mimeType": "image/png",
                         "nameOnServer": "c2gQT5IMJAYqx89eo8gwFrKJSRxlFYFU"
                     },
                     "picture": {
                         "originalName": "2015-01-11 21.30.05 HDR.jpg",
                         "size": 1551587,
                         "mimeType": "image/png",
                         "nameOnServer": "jf7mBTsU6CVfFPLsnY4Ijqcuo6vYTKAs"
                     }
                 }
             },
             "userModelTarget": {
                 "_id": "56c32acd331dd81f8134f200",
                 "name": "Ken",
                 "sortName": "ken yasue",
                 "description": "ああああ",
                 "userid": "kenyasue",
                 "password": "*****",
                 "created": 1455631053660,
                 "status": 1,
                 "organizationId": "56ab7b9061b760d9eb6feba3",
                 "__v": 0,
                 "tokenGeneratedAt": 1457362225645,
                 "token": "*****",
                 "groups": ["56cf0a60ed51d2905e28a848", "56cf0897ed51d2905e28a726"],
                 "avatar": {
                     "thumbnail": {
                         "originalName": "2015-01-11 21.30.05 HDR.jpg",
                         "size": 1551587,
                         "mimeType": "image/png",
                         "nameOnServer": "c2gQT5IMJAYqx89eo8gwFrKJSRxlFYFU"
                     },
                     "picture": {
                         "originalName": "2015-01-11 21.30.05 HDR.jpg",
                         "size": 1551587,
                         "mimeType": "image/png",
                         "nameOnServer": "jf7mBTsU6CVfFPLsnY4Ijqcuo6vYTKAs"
                     }
                 }
             }
         }, {
             "_id": "56dd9522f3e5890d4700b9e5",
             "user": "56c32ae5331dd81f8134f201",
             "userID": "56c32acd331dd81f8134f200",
             "roomID": "2-56cf082ded51d2905e28a6d4",
             "message": "zzz",
             "localID": "_z4a5fHmI2J55yOcbtmtt4MReZBiiXtD1",
             "type": 1,
             "created": 1457362210967,
             "__v": 0,
             "seenBy": [],
             "userModel": {
                 "_id": "56c32acd331dd81f8134f200",
                 "name": "Ken",
                 "sortName": "ken yasue",
                 "description": "ああああ",
                 "userid": "kenyasue",
                 "password": "*****",
                 "created": 1455631053660,
                 "status": 1,
                 "organizationId": "56ab7b9061b760d9eb6feba3",
                 "__v": 0,
                 "tokenGeneratedAt": 1457362225645,
                 "token": "*****",
                 "groups": ["56cf0a60ed51d2905e28a848", "56cf0897ed51d2905e28a726", "56cf08cded51d2905e28a754"],
                 "avatar": {
                     "thumbnail": {
                         "originalName": "2015-01-11 21.30.05 HDR.jpg",
                         "size": 1551587,
                         "mimeType": "image/png",
                         "nameOnServer": "c2gQT5IMJAYqx89eo8gwFrKJSRxlFYFU"
                     },
                     "picture": {
                         "originalName": "2015-01-11 21.30.05 HDR.jpg",
                         "size": 1551587,
                         "mimeType": "image/png",
                         "nameOnServer": "jf7mBTsU6CVfFPLsnY4Ijqcuo6vYTKAs"
                     }
                 }
             },
             "groupModel": {
                 "_id": "56cf082ded51d2905e28a6d4",
                 "organizationId": "56ab7b9061b760d9eb6feba3",
                 "name": "BlogXS",
                 "sortName": "BlogXS",
                 "description": "lorem quisque ut erat curabitur gravida nisi at nibh in hac habitasse platea dictumst aliquam augue",
                 "created": 1456408621251,
                 "__v": 0,
                 "users": ["56c32bdfdb88293409a20234", "56c32b79db88293409a2008b", "56c32c02db88293409a202cb"],
                 "avatar": {
                     "thumbnail": {
                         "originalName": "vAnLjyXV9FSnQo6TRDdtOUqBlMQATMXi",
                         "size": 1,
                         "mimeType": "image/png",
                         "nameOnServer": "vAnLjyXV9FSnQo6TRDdtOUqBlMQATMXi"
                     },
                     "picture": {
                         "originalName": "EU0IS6053tCts0Ar8sPQYPrcxtfqZPwX",
                         "size": 1,
                         "mimeType": "image/png",
                         "nameOnServer": "EU0IS6053tCts0Ar8sPQYPrcxtfqZPwX"
                     }
                 }
             }
         }, {
             "_id": "56dd9527f3e5890d4700b9e6",
             "user": "56c32ae5331dd81f8134f201",
             "userID": "56c32acd331dd81f8134f200",
             "roomID": "3-56d9b199cdcc4b69755a5431",
             "message": "zzz",
             "localID": "_ScfrTjXRdxjNNa3laUtclNpIKuGZggP4",
             "type": 1,
             "created": 1457362215637,
             "__v": 0,
             "seenBy": [],
             "userModel": {
                 "_id": "56c32acd331dd81f8134f200",
                 "name": "Ken",
                 "sortName": "ken yasue",
                 "description": "ああああ",
                 "userid": "kenyasue",
                 "password": "*****",
                 "created": 1455631053660,
                 "status": 1,
                 "organizationId": "56ab7b9061b760d9eb6feba3",
                 "__v": 0,
                 "tokenGeneratedAt": 1457362225645,
                 "token": "*****",
                 "groups": ["56cf0a60ed51d2905e28a848", "56cf0897ed51d2905e28a726", "56cf08cded51d2905e28a754"],
                 "avatar": {
                     "thumbnail": {
                         "originalName": "2015-01-11 21.30.05 HDR.jpg",
                         "size": 1551587,
                         "mimeType": "image/png",
                         "nameOnServer": "c2gQT5IMJAYqx89eo8gwFrKJSRxlFYFU"
                     },
                     "picture": {
                         "originalName": "2015-01-11 21.30.05 HDR.jpg",
                         "size": 1551587,
                         "mimeType": "image/png",
                         "nameOnServer": "jf7mBTsU6CVfFPLsnY4Ijqcuo6vYTKAs"
                     }
                 }
             },
             "roomModel": {
                 "_id": "56d9b199cdcc4b69755a5431",
                 "owner": "56c32acd331dd81f8134f200",
                 "name": "Notification Test",
                 "created": 1457107353959,
                 "__v": 0,
                 "avatar": {
                     "thumbnail": {
                         "originalName": "ZrylJtaVOkhHoCiz7R1kPcuTU8mChIZe",
                         "size": 118868,
                         "mimeType": "image/png",
                         "nameOnServer": "ZrylJtaVOkhHoCiz7R1kPcuTU8mChIZe"
                     },
                     "picture": {
                         "originalName": "ZrylJtaVOkhHoCiz7R1kPcuTU8mChIZe",
                         "size": 118868,
                         "mimeType": "image/png",
                         "nameOnServer": "ZrylJtaVOkhHoCiz7R1kPcuTU8mChIZe"
                     }
                 },
                 "users": ["56c32acd331dd81f8134f200", "56d375b7b92c46fc0403a8eb"]
             }
         }],
         "count": 3
     }
 }
 
 **/

    router.get('/:keyword/:page', tokenChecker, function (request, response) {

        var keyword = decodeURIComponent(request.params.keyword);
        var page = request.params.page - 1;

        SearchMessageLogic.search(request.user, keyword, page, (result) => {

            self.successResponse(response, Const.responsecodeSucceed, {
                messages: result.messages,
                count: result.count
            });

        }, (err) => {

            console.log("critical err", err);
            self.errorResponse(response, Const.httpCodeServerError);

        });

    });

    return router;

}

module["exports"] = new SearchMessageController();
