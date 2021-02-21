var {Service, Characteristic} = require('../homebridge.js')
var Accessory = require('../accessory.js');

module.exports = class extends Accessory {

    constructor(options) {

		super(options);
		
		this.addService(new Service.TemperatureSensor(this.name, this.UUID));
		this.enableCurrentTemperature(Service.TemperatureSensor);
    }

	enableCurrentTemperature(service) {
		var {topic} = this.config['current-temperature'];

		this.currentTemperature = 20;

		var getter = async () => {
			return this.currentTemperature;
		}

		this.enableCharacteristic(service, Characteristic.CurrentTemperature, getter, undefined);

		if (topic) {
			this.on(topic, (value) => {
				this.currentTemperature = value;
				this.debug(`CurrentTemperature:${topic}:${this.currentTemperature}`);
				this.updateCharacteristicValue(service, Characteristic.CurrentTemperature, this.currentTemperature);	
			});			
			
			this.platform.subscribe(topic);	
		}
	}



}

