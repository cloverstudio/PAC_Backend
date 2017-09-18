const _ = require('lodash');
const SendMessageV2 = require('../SendMessage');

const SendMessage = {};

_.extend(SendMessage, SendMessageV2);

module["exports"] = SendMessage;