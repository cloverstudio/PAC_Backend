const _ = require('lodash');
const NewUserV2 = require('../NewUser');

const NewUser = {};

_.extend(NewUser, NewUserV2);

module["exports"] = NewUser;