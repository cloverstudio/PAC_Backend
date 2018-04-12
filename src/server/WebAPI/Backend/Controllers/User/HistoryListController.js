/** Called for /api/v2/user/history/:page API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var tokenChecker = require(pathTop + 'lib/authApi');
var SearchHistoryLogic = require(pathTop + 'Logics/SearchHistory');

var BackendBase = require('../BackendBase');

var HistioryListController = function () {
}

_.extend(HistioryListController.prototype, BackendBase.prototype);

HistioryListController.prototype.init = function (app) {

    var self = this;

	/**
	  * @api {get} /api/v2/user/history/:page historylist
	  * @apiName History List
	  * @apiGroup WebAPI
	  * @apiDescription Returns user histoy
	  * @apiHeader {String} access-token Users unique access-token.
	  * @apiSuccessExample Success-Response:
 
 {
	 "code": 1,
	 "time": 1458058376999,
	 "data": {
		 "list": [{
			 "_id": "56e83466e804ad952eb49863",
			 "userId": "56e6b6d206552124125cdb86",
			 "chatId": "56dee3091f9b351bcd4e546a",
			 "chatType": 2,
			 "lastUpdate": 1458058343838,
			 "lastUpdateUser": {
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
				 "tokenGeneratedAt": 1458058317218,
				 "token": "*****",
				 "groups": ["56e7ef842500caf2eda5d5fb", "56e7da1671be6b38d3beb967", "56dee2fd1f9b351bcd4e5469"],
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
			 "lastMessage": {
				 "type": 1,
				 "created": 1458058343831,
				 "message": "4"
			 },
			 "unreadCount": 4,
			 "__v": 0,
			 "group": {
				 "_id": "56dee3091f9b351bcd4e546a",
				 "name": "Developers",
				 "sortName": "developers",
				 "description": "",
				 "created": 1457447689335,
				 "organizationId": "56ab7b9061b760d9eb6feba3",
				 "parentId": "56dee2fd1f9b351bcd4e5469",
				 "type": 2,
				 "__v": 0,
				 "users": ["56e6b6d706552124125cdb87", "56e6b71106552124125cdb8c", "56e6b71306552124125cdb8d", "56e6b71f06552124125cdb8e", "56e6b72806552124125cdb8f", "56e6b73206552124125cdb90", "56e6b73706552124125cdb91", "56e6b73d06552124125cdb92", "56e6b6d206552124125cdb86"],
				 "usersCount": 9,
				 "userModels": [{
					 "_id": "56e6b6d206552124125cdb86",
					 "name": "user1",
					 "sortName": "user1",
					 "description": "user1",
					 "userid": "testuser1",
					 "password": "*****",
					 "created": 1457960658915,
					 "status": 1,
					 "organizationId": "56ab7b9061b760d9eb6feba3",
					 "__v": 0,
					 "tokenGeneratedAt": 1458058365344,
					 "token": "*****",
					 "groups": ["56e7da1671be6b38d3beb967", "56dee3091f9b351bcd4e546a"]
				 }, {
					 "_id": "56e6b6d706552124125cdb87",
					 "name": "user2",
					 "sortName": "user2",
					 "description": "user1",
					 "userid": "testuser2",
					 "password": "*****",
					 "created": 1457960663961,
					 "status": 1,
					 "organizationId": "56ab7b9061b760d9eb6feba3",
					 "__v": 0,
					 "groups": ["56dee3091f9b351bcd4e546a"]
				 }, {
					 "_id": "56e6b71106552124125cdb8c",
					 "name": "user3",
					 "sortName": "user3",
					 "description": "",
					 "userid": "testuser3",
					 "password": "*****",
					 "created": 1457960721257,
					 "status": 1,
					 "organizationId": "56ab7b9061b760d9eb6feba3",
					 "__v": 0,
					 "groups": ["56dee3091f9b351bcd4e546a"]
				 }, {
					 "_id": "56e6b71306552124125cdb8d",
					 "name": "user4",
					 "sortName": "user4",
					 "description": "",
					 "userid": "testuser4",
					 "password": "*****",
					 "created": 1457960723968,
					 "status": 1,
					 "organizationId": "56ab7b9061b760d9eb6feba3",
					 "__v": 0,
					 "groups": ["56dee3091f9b351bcd4e546a"]
				 }, {
					 "_id": "56e6b71f06552124125cdb8e",
					 "name": "user6",
					 "sortName": "user6",
					 "description": "",
					 "userid": "testuser6",
					 "password": "*****",
					 "created": 1457960735226,
					 "status": 1,
					 "organizationId": "56ab7b9061b760d9eb6feba3",
					 "__v": 0,
					 "groups": ["56dee3091f9b351bcd4e546a"]
				 }]
			 }
		 }, {
			 "_id": "56e83451e804ad952eb49857",
			 "userId": "56e6b6d206552124125cdb86",
			 "chatId": "56e7da1671be6b38d3beb967",
			 "chatType": 2,
			 "lastUpdate": 1458058322044,
			 "lastUpdateUser": {
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
				 "tokenGeneratedAt": 1458058317218,
				 "token": "*****",
				 "groups": ["56e7ef842500caf2eda5d5fb", "56e7da1671be6b38d3beb967", "56dee2fd1f9b351bcd4e5469"],
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
			 "lastMessage": {
				 "type": 1,
				 "created": 1458058322036,
				 "message": "d"
			 },
			 "unreadCount": 3,
			 "__v": 0,
			 "group": {
				 "_id": "56e7da1671be6b38d3beb967",
				 "name": "test",
				 "sortName": "test",
				 "description": "test",
				 "created": 1458035222590,
				 "organizationId": "56ab7b9061b760d9eb6feba3",
				 "type": 1,
				 "__v": 0,
				 "users": ["56c32acd331dd81f8134f200", "56e6b6d206552124125cdb86"],
				 "usersCount": 2,
				 "userModels": [{
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
					 "tokenGeneratedAt": 1458058317218,
					 "token": "*****",
					 "groups": ["56e7ef842500caf2eda5d5fb", "56e7da1671be6b38d3beb967", "56dee2fd1f9b351bcd4e5469"],
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
				 }, {
					 "_id": "56e6b6d206552124125cdb86",
					 "name": "user1",
					 "sortName": "user1",
					 "description": "user1",
					 "userid": "testuser1",
					 "password": "*****",
					 "created": 1457960658915,
					 "status": 1,
					 "organizationId": "56ab7b9061b760d9eb6feba3",
					 "__v": 0,
					 "tokenGeneratedAt": 1458058365344,
					 "token": "*****",
					 "groups": ["56e7da1671be6b38d3beb967", "56dee3091f9b351bcd4e546a"]
				 }]
			 }
		 }, {
			 "_id": "56e83277fabab6dd2c0e1860",
			 "userId": "56e6b6d206552124125cdb86",
			 "chatId": "56c32acd331dd81f8134f200",
			 "chatType": 1,
			 "lastUpdate": 1458058176955,
			 "isUnread": 1,
			 "lastUpdateUser": {
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
				 "tokenGeneratedAt": 1458058165516,
				 "token": "*****",
				 "groups": ["56e7ef842500caf2eda5d5fb", "56e7da1671be6b38d3beb967", "56dee2fd1f9b351bcd4e5469"],
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
			 "lastMessage": {
				 "type": 1,
				 "created": 1458058176946,
				 "message": "ss"
			 },
			 "unreadCount": 7,
			 "__v": 0,
			 "user": {
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
				 "tokenGeneratedAt": 1458058317218,
				 "token": "*****",
				 "groups": ["56e7ef842500caf2eda5d5fb", "56e7da1671be6b38d3beb967", "56dee2fd1f9b351bcd4e5469"],
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
				 },
				 "onlineStatus": 1
			 }
		 }],
		 "count": 3,
		 "totalUnreadCount": 20
	 }
 }
 **/

    router.get('/:page', tokenChecker, function (request, response) {

        var page = 0;

        if (request.params.page)
            page = request.params.page - 1

        SearchHistoryLogic.search(0, page, request.query.keyword, request.user, (result) => {

            self.successResponse(response, Const.responsecodeSucceed, result);

        }, (err) => {

            console.log("critical err", err);
            self.errorResponse(response, Const.httpCodeServerError);

        });

    });

	/**
	  * @api {get} /api/v2/user/history/diff/:lastUpdate historylist for update
	  * @apiName History List for update
	  * @apiGroup WebAPI
	  * @apiDescription Returns user history which is updated from lastUpdate param
	  * @apiHeader {String} access-token Users unique access-token.
	  * @apiSuccessExample Success-Response:
	  * same as history list
	  **/

    router.get('/diff/:lastUpdate', tokenChecker, function (request, response) {

        SearchHistoryLogic.search(request.params.lastUpdate, 0, null, request.user, (result) => {

            self.successResponse(response, Const.responsecodeSucceed, result);

        }, (err) => {

            console.log("critical err", err);
            self.errorResponse(response, Const.httpCodeServerError);

        });

    });

    return router;

}

module["exports"] = new HistioryListController();
