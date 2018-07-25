/**  device versions */

var _ = require('lodash');

var Config = require("../lib/init");
var DatabaseManager = require('../lib/DatabaseManager');

var BaseModel = require('./BaseModel');

var DeviceVersion = function () { };

_.extend(DeviceVersion.prototype, BaseModel.prototype);

DeviceVersion.prototype.init = function (mongoose) {

    this.schema = new mongoose.Schema({
        iosBuildVersion: String,
        androidBuildVersion: String
    });

    this.model = mongoose.model(Config.dbCollectionPrefix + "device_version", this.schema);

}

DeviceVersion.get = function () {

    return DatabaseManager.getModel('DeviceVersion').model;

}

module["exports"] = DeviceVersion;
