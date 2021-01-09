"use strict";

var Homebridge = require('./src/homebridge.js');

module.exports = function(api) {

    Homebridge.Service = api.hap.Service;
    Homebridge.Characteristic = api.hap.Characteristic;
    Homebridge.Accessory = api.hap.Accessory;
    Homebridge.PlatformAccessory = api.platformAccessory;
    Homebridge.API = api;

    api.registerPlatform('homebridge-http-request', 'HTTP Request', require('./src/platform.js'));
};
