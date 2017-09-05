const _ = require('lodash');
const UpdateOrganizationDiskUsageV2 = require('../UpdateOrganizationDiskUsage');

const UpdateOrganizationDiskUsage = {};

_.extend(UpdateOrganizationDiskUsage, UpdateOrganizationDiskUsageV2);

module["exports"] = UpdateOrganizationDiskUsage;