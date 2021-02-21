var {Service, Characteristic} = require('../homebridge.js')
var Accessory = require('../accessory.js');


module.exports = class MotionSensor extends Accessory {

    constructor(options) {

		super(options);
		
		this.addService(new Service.MotionSensor(this.name, this.UUID));
		this.enableMotionDetected(Service.MotionSensor);
    }

	enableMotionDetected(service) {
		var topic = this.config['motion-detected'].topic;

		if (topic) {
			this.motionDetected = false;
	
			var getter = async () => {
				return this.motionDetected;
			}
		
			var setter = async (value) => {
				try {
					this.motionDetected = value ? true : false;
					this.platform.publish(topic, this.motionDetected);
				}
				catch (error) {
					this.log(error);
				}
		
			}

			this.enableCharacteristic(service, Characteristic.MotionDetected, getter, setter);

			this.on(topic, (value) => {
				this.motionDetected = value ? true : false;
				this.debug(`Motion detected ${topic}:${this.motionDetected}`);
				this.updateCharacteristicValue(service, Characteristic.MotionDetected, this.motionDetected);	
			});			
			
			this.platform.subscribe(topic);
		}
	}



}

