var {Service, Characteristic} = require('../homebridge.js')
var Switch = require('./switch.js');
var Accessory = require('../accessory.js');

module.exports = class Lightbulb extends Accessory {

    constructor(options) {
		super(options);
		
		this.addService(new Service.Lightbulb(this.name, this.UUID));
		this.enableOnOff(Service.Lightbulb);
		this.enableBrightness(Service.Lightbulb);
    }


	enableOnOff(service) {

		var {topic, get:getTopic, set:setTopic} = this.config['onoff'];

		if (topic) {
			getTopic = setTopic = topic;
		}

		this.onoff = false;

		var getter = async () => {
			return this.onoff;
		}

		var setter = async (value) => {
			try {
				this.onoff = value ? true : false;
	
				if (setTopic) 
					this.platform.publish(setTopic, this.onoff);
	
			}
			catch (error) {
				this.log(error);
			}
	
		};

		this.enableCharacteristic(service, Characteristic.On, getter, setter);		

		if (getTopic) {
			this.on(getTopic, (value) => {
				this.onoff = value;
	
				this.debug(`On:${getTopic}:${this.onoff}`);
				this.updateCharacteristicValue(service, Characteristic.On, this.onoff);	
			});				

			this.platform.subscribe(getTopic);
		}		
	}

	enableBrightness(service) {

		var {topic, minValue = 0, maxValue = 100} = this.config['brightness'];

		this.brightness = 100;

		var getter = async () => {
			return this.brightness;
		}

		var setter = async (value) => {
			try {
				this.brightness = value;
	
				if (topic) 
					this.platform.publish(topic, JSON.stringify(this.brightness / (100 / (maxValue - minValue))));
	
			}
			catch (error) {
				this.log(error);
			}
	
		};

		this.enableCharacteristic(service, Characteristic.Brightness, getter, setter);		

		if (topic) {
			this.on(topic, (value) => {
				this.brightness = value * (100 / (maxValue - minValue));
	
				this.debug(`Brightness ${topic}:${this.brightness}`);
				this.updateCharacteristicValue(service, Characteristic.Brightness, this.brightness);	
			});				

			this.platform.subscribe(topic);
		}		
	}


}

