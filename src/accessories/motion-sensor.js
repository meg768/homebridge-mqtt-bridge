var {Service, Characteristic} = require('../homebridge.js')
var Accessory = require('../accessory.js');


module.exports = class MotionSensor extends Accessory {

    constructor(options) {

		super(options);
		
		this.addService(new Service.MotionSensor(this.name, this.UUID));
		this.enableMotionDetected(Service.MotionSensor);
    }



}

