var {Service, Characteristic} = require('../homebridge.js')
var Switch = require('./switch.js');
var Accessory = require('../accessory.js');

module.exports = class Lightbulb extends Accessory {

    constructor(options) {
		super(options);
		
		this.addService(new Service.Lightbulb(this.name, this.UUID));
		this.enableOnOff(Service.Lightbulb);
		this.enableBrightness(Service.Lightbulb);
		this.enableColorTemperature(Service.Lightbulb);
    }





}

