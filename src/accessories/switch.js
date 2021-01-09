var {Service, Characteristic} = require('../homebridge.js')
var Accessory = require('../accessory.js');

module.exports = class extends Accessory {

    constructor(options) {

		super(options);
		
		var state = true;
		var service = new Service.Switch(this.name, this.UUID);
		var characteristic = service.getCharacteristic(Characteristic.On);
		var mqtt = this.platform.mqtt;

		var topic = 'homey/devices/kontoret/a/onoff';

		mqtt.subscribe(topic, () => {});

		mqtt.on('message', (topic, message) => {
			message = message.toString();

			this.debug(`Topic ${topic} message ${message}`);

			state = eval(message);
			characteristic.updateValue(state);
		});

		var turnOnOff = (value) => {
			value = value ? true : false;

			return new Promise((resolve, reject) => {
	
				this.debug(`Payload XXX`);
	
				Promise.resolve().then(() => {
					this.debug(`Bounce XXX.`);
					setTimeout(() => {
						state = !state;

						this.debug(`Switch state reset to ${state}.`);
						characteristic.updateValue(state);
					}, 2000);	
					resolve();
				})
				.catch((error) => {
					this.log(error);
					reject(error);
				})
	
			});

		};


		var setter = (value) => {
			return turnOnOff(value);
		};

		var getter = () => {
			return Promise.resolve(state);
		};
		
		this.addService(service);
		this.addCharacteristic(service, Characteristic.On, setter, getter);

    }

}

