var {Service, Characteristic} = require('../homebridge.js')
var Accessory = require('../accessory.js');


module.exports = class MotionSensor extends Accessory {

    constructor(options) {

		super(options);
		
		this.addService(new Service.MotionSensor(this.name, this.UUID));
		this.enableMotionDetected(Service.MotionSensor);
    }

	enableMotionDetected(service) {

		var config = this.config['motion-detected'];
		var characteristic = this.getService(service).getCharacteristic(Characteristic.MotionDetected);

		if (config) {
			this.motionDetected = characteristic.value;

			characteristic.on('get', (callback) => {
				callback(null, this.motionDetected);
            });

			characteristic.on('set', (value, callback) => {
				this.motionDetected = value;

				if (config.set)
					this.platform.publish(config.set, this.motionDetected);

				callback();

			});

			if (config.get) {
				this.on(config.get, (value) => {
					this.motionDetected = value ? true : false;
					this.debug(`Motion detected ${config.get}:${this.motionDetected}`);
					characteristic.updateValue(this.motionDetected);	
				});			
				
				this.platform.subscribe(config.get);

			}
	
		}
	}



}

