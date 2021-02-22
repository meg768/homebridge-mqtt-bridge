var {Service, Characteristic} = require('../homebridge.js')
var Accessory = require('../accessory.js');

module.exports = class Switch extends Accessory {

    constructor(options) {

		var {service = Service.Switch, ...options} = options;

		super(options);
		
		this.addService(new service(this.name, this.UUID));
		this.enableOnOff(service);
    }

	enableOnOff(service) {
		var config = this.config['onoff'];
		var characteristic = this.getService(service).getCharacteristic(Characteristic.On);

		if (config) {
			this.onoff = characteristic.getDefaultValue();

			characteristic.on('get', (callback) => {
				callback(null, this.onoff);
            });

			characteristic.on('set', (value, callback) => {
				this.onoff = value;

				if (config.set)
					this.platform.publish(config.set, this.onoff);

				callback();

			});
	
			if (config.get) {
				this.on(config.get, (value) => {
					this.onoff = value;
					this.debug(`OnOff:${config.get}:${this.onoff}`);
					characteristic.updateValue(this.onoff);	
				});				
	
				this.platform.subscribe(config.get);
			}		
	
		}
	}



}

