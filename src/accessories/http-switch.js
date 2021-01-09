var {Service, Characteristic} = require('../homebridge.js')
var Accessory = require('../accessory.js');

module.exports = class extends Accessory {

    constructor(options) {

		super(options);
		
		var state = true;
		var service = new Service.Switch(this.name, this.UUID);
		var characteristic = service.getCharacteristic(Characteristic.On);

		var turnOnOff = (value) => {
			var Request  = require('yow/request');
			var isObject = require('yow/isObject');
			var isString = require('yow/isString');
			var bounce   = typeof this.config.bounce == "boolean" ? 1000 : Number(this.config.bounce);

			state = value;

			var {method = 'get', url, query, body} = value ? this.config.turnOn : this.config.turnOff;

			if (url == undefined)
				return Promise.resolve();

			return new Promise((resolve, reject) => {
	
				var request = new Request(url);
				var options = {};
		
				if (isObject(body))
					options.body = body;
		
				if (isObject(query))
					options.query = query;

				this.debug(`Connecting to '${url}' using method '${method}'...`);
				this.debug(`Payload ${JSON.stringify(options)}`);
	
				request.request(method, options).then(() => {
					this.debug(`Bounce ${bounce}.`);
					if (bounce) {
						this.debug(`Bounce specified in switch config. Delaying ${bounce} ms to revert to original value.`);
						setTimeout(() => {
							state = !state;

							this.debug(`Switch state reset to ${state}.`);
							characteristic.updateValue(state);
						}, bounce);	
					}
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

