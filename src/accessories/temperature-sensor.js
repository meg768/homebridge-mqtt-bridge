var {Service, Characteristic} = require('../homebridge.js')
var Accessory = require('../accessory.js');

module.exports = class extends Accessory {

    constructor(options) {

		super(options);
		
		this.addService(new Service.TemperatureSensor(this.name, this.UUID));
		this.enableCurrentTemperature(Service.TemperatureSensor);
    }

	enableCurrentTemperature(service) {
		var config = this.config['current-temperature'];
		var characteristic = this.getService(service).getCharacteristic(Characteristic.CurrentTemperature);

		if (config) {
			this.currentTemperature = characteristic.getDefaultValue();

			characteristic.on('get', (callback) => {
				callback(null, this.currentTemperature);
            });

			if (config.get) {
				this.on(config.get, (value) => {
					this.currentTemperature = value;
					this.debug(`CurrentTemperature:${config.get}:${this.currentTemperature}`);
					characteristic.updateValue(this.currentTemperature);	
				});			
				
				this.platform.subscribe(config.get);	
			}
	
		}

	}



}

