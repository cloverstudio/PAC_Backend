/** Called for /api/v2/user/history/:page API */

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var async = require('async');

var pathTop = "../../../../";

var Const = require(pathTop + "lib/consts");
var Config = require(pathTop + "lib/init");
var DatabaseManager = require(pathTop + 'lib/DatabaseManager');
var Utils = require(pathTop + 'lib/utils');
var GroupModel = require(pathTop + 'Models/Group');
var UserModel = require(pathTop + 'Models/User');
var RoomModel = require(pathTop + 'Models/Room');
var HistoryModel = require(pathTop + 'Models/History');
var OrganizationModel = require(pathTop + 'Models/Organization');
var GetUserOnlineStatus = require(pathTop + 'Logics/GetUserOnlineStatus');
var tokenChecker = require(pathTop + 'lib/authApi');

var TotalUnreadCount = require(pathTop + 'Logics/TotalUnreadCount');

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

		if (request.params.page) {
			page = request.params.page - 1
		}

		self.getList(0, page, request.query.keyword, request, response);

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

		self.getList(request.params.lastUpdate, 0, null, request, response);

	});

	return router;

}

HistioryListController.prototype.getList = function (
	lastUpdate,
	page,
	keyword,
	request,
	response) {

	var self = this;

	var user = request.user;

	var model = HistoryModel.get();

	async.waterfall([function (done) {

		var result = {};
		var query = null;

		if (lastUpdate > 0) {

			query = model.find({
				userId: user._id.toString(),
				$or: [
					{ lastUpdate: { $gt: lastUpdate } },
					{ lastUpdateUnreadCount: { $gt: lastUpdate } }
				]
			})
				.sort({ "lastUpdate": "desc" });

		} else {

			const conditions = {
				userId: user._id.toString()
			};

			if (keyword) {
				conditions.keyword = new RegExp('^.*' + Utils.escapeRegExp(keyword) + '.*$', "i")
			}

			if (!page || page < 1)
				page = 0;

			query = model.find(conditions)
				.sort({ "lastUpdate": "desc" })
				.skip(Const.pagingRows * page)
				.limit(Const.pagingRows);

		}


		query.exec(function (err, data) {

			if (err) {
				done(err, result);
				return;
			}

			result.list = data.map(function (item) {
				return item.toObject();
			});

			if (data.length > 100)
				console.log(lastUpdate, data[100].toObject());

			done(err, result);

		});

	},
	function (result, done) {

		model.count({
			userId: user._id.toString()
		}, function (err, countResult) {

			result.count = countResult;

			done(null, result);

		});

	},
	function (result, done) {

		// get users
		var userIds = _.pluck(_.filter(result.list, function (row) {
			return row.chatType == Const.chatTypePrivate
		}), 'chatId');

		var model = UserModel.get();

		userIds = _.filter(userIds, (userId) => {

			return Utils.isObjectId(userId);

		});

		model.find({
			_id: { $in: userIds }
		}, function (err, findResult) {

			_.forEach(result.list, function (row, index, alias) {

				_.forEach(findResult, function (user) {

					if (user._id == row.chatId) {

						result.list[index].user = user.toObject();

					}

				});

			});

			// delete room which user is null
			result.list = _.filter(result.list, function (row) {

				if (row.chatType != Const.chatTypePrivate) {
					return true;
				}

				return !_.isEmpty(row.user);

			});

			done(err, result);

		});

	},
	function (result, done) {

		// get groups
		var groupIds = _.pluck(_.filter(result.list, function (row) {
			return row.chatType == Const.chatTypeGroup
		}), 'chatId');

		var model = GroupModel.get();

		model.find({
			_id: { $in: groupIds }
		}, function (err, findResult) {

			_.forEach(result.list, function (row, index, alias) {

				_.forEach(findResult, function (group) {

					if (group._id == row.chatId) {

						result.list[index].group = group.toObject();

					}

				});

			});

			// delete room which user is null
			result.list = _.filter(result.list, function (row) {

				if (row.chatType != Const.chatTypeGroup) {
					return true;
				}

				return !_.isEmpty(row.group);

			});

			done(null, result);

		});

	},

	function (result, done) {

		// get room
		var roomIds = _.pluck(_.filter(result.list, function (row) {
			return row.chatType == Const.chatTypeRoom
		}), 'chatId');

		var model = RoomModel.get();

		model.find({
			_id: { $in: roomIds }
		}, function (err, findResult) {

			_.forEach(result.list, function (row, index, alias) {

				_.forEach(findResult, function (room) {

					if (room._id == row.chatId) {

						result.list[index].room = room.toObject();

					}

				});

			});

			// delete room which room is null
			result.list = _.filter(result.list, function (row) {

				if (row.chatType != Const.chatTypeRoom) {
					return true;
				}

				return !_.isEmpty(row.room);

			});

			done(null, result);

		});

	},
	function (result, done) {

		var userIdsFromGroup = [];

		// make sure at least 4 users from each history
		_.forEach(_.pluck(result.list, 'group.users'), function (row) {

			if (!_.isArray(row))
				return;

			userIdsFromGroup = userIdsFromGroup.concat(row.slice(0, 4));

		});

		var userIdsFromRoom = [];

		// make sure at least 4 users from each history
		_.forEach(_.pluck(result.list, 'room.users'), function (row) {

			if (!_.isArray(row))
				return;

			userIdsFromRoom = userIdsFromRoom.concat(row.slice(0, 4));

		});

		_.forEach(_.pluck(result.list, 'room.owner'), function (row) {

			if (!row)
				return;

			userIdsFromRoom = userIdsFromRoom.concat(row);

		});

		var userIds = _.unique(userIdsFromGroup.concat(userIdsFromRoom));

		var model = UserModel.get();


		model.find(
			{
				_id: { $in: userIds }
			},
			UserModel.defaultResponseFields,
			function (err, findResult) {

				_.forEach(result.list, function (row, index, alias) {

					if (row.chatType == Const.chatTypeGroup && (row.group && _.isArray(row.group.users))) {

						var userModels = _.filter(findResult, function (userModel) {

							if (row.group.users.indexOf(userModel._id.toString()) != -1) {
								return true;
							}
						});

						alias[index].group.usersCount = alias[index].group.users.length;

						alias[index].group.userModels = userModels.map(function (item) {
							return item.toObject();
						});

					}

				});

				_.forEach(result.list, function (row, index, alias) {

					if (row.chatType == Const.chatTypeRoom && row.room) {

						if (_.isArray(row.room.users)) {

							var userModels = _.filter(findResult, function (userModel) {

								if (row.room.users.indexOf(userModel._id.toString()) != -1) {
									return true;
								}

							});

							alias[index].room.usersCount = alias[index].room.users.length;

							alias[index].room.userModels = userModels.map(function (item) {
								return item.toObject();
							});

						}


						// get owner
						alias[index].room.ownerModel = _.find(findResult, function (userModel) {

							return row.room.owner == userModel._id.toString();

						});

					}

				});


				done(err, result);

			});


	},
	function (result, done) {

		TotalUnreadCount.get(user._id.toString(), function (err, unreadCount) {

			result.totalUnreadCount = unreadCount;
			done(err, result);

		});


	},
	function (result, done) {

		// get online status
		var userIds = _.map(_.pluck(result.list, 'user._id'), function (userIdObj) {
			if (userIdObj)
				return userIdObj.toString();
		});

		GetUserOnlineStatus.get(userIds, function (err, onlineStatusResult) {

			_.forEach(result.list, function (historyObj, index) {

				if (historyObj.user) {

					var onlineStatusObj = _.find(onlineStatusResult, function (onlineStatusRow) {

						return onlineStatusRow.userId == historyObj.user._id.toString();

					});

					if (onlineStatusObj)
						result.list[index].user.onlineStatus = onlineStatusObj.onlineStatus;
					else
						result.list[index].user.onlineStatus = 0;
				}

			});

			done(null, result);

		});

	}],
		function (err, result) {

			if (err) {
				console.log("critical err", err);
				self.errorResponse(response, Const.httpCodeServerError);
				return;
			}

			self.successResponse(response, Const.responsecodeSucceed, result);

		});

}

module["exports"] = new HistioryListController();
