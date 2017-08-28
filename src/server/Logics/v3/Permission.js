const _ = require('lodash');
const PermissionV2 = require('../Permission');

const Permission = {};

_.extend(Permission, PermissionV2);

module["exports"] = Permission;