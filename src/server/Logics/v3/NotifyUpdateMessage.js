const _ = require('lodash');
const NotifyUpdateMessageV2 = require('../NotifyUpdateMessage');

const NotifyUpdateMessage = {};

_.extend(NotifyUpdateMessage, NotifyUpdateMessageV2);

module["exports"] = NotifyUpdateMessage;