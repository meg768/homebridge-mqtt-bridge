var {API, Service, Characteristic} = require('./homebridge.js');
var Events = require('events');


module.exports = class extends Events  {

    constructor(options) {
		super();

        var {config, platform} = options;

		if (config == undefined)
			throw new Error('A configuration of the accessory must be specified.');

		if (platform.config.name == undefined)
			throw new Error('The platform must have a name.');

		if (config.name == undefined)
			throw new Error('The accessory must have a name.');

		var uniqueName = `${platform.config.name}-${config.name}`;
		var uuid = API.hap.uuid.generate(uniqueName);

		this.name = config.name;

		// Apparently we need a display name...
		this.displayName = config.name;

		// Seems like we have to set the uuid_base member to a unique ID to have several platforms with accessories with the same name
		this.uuid_base = uuid;

		// What do I know, but this is set also...
		this.UUID = uuid;
		this.uuid = uuid;
		
		this.platform = platform;
		this.config = config;
		this.log = platform.log;
		this.debug = platform.debug;
		this.services = [];

        this.addService(new Service.AccessoryInformation()); 
		this.updateCharacteristicValue(Service.AccessoryInformation, Characteristic.FirmwareRevision, "1.0");

	}

	addService(service) {
        this.services.push(service);
    }

	getServices() {
		return this.services;
	}
	
    getService(name) {
        if (name instanceof Service)
            return name;

        for (var index in this.services) {
            var service = this.services[index];
            
            if (typeof name === 'string' && (service.displayName === name || service.name === name))
                return service;
            else if (typeof name === 'function' && ((service instanceof name) || (name.UUID === service.UUID)))
                return service;
          }
        
    }	
    
    updateCharacteristicValue(service, characteristic, value) {
        this.getService(service).getCharacteristic(characteristic).updateValue(value);
    }


    enableCharacteristic(service, characteristic, getter, setter) {

        service = this.getService(service);
        
        if (typeof getter === 'function') {
            service.getCharacteristic(characteristic).on('get', async (callback) => {
				try {
					var value = await getter();
					callback(null, value);
				}
				catch(error) {
					this.log(error);
					callback();
				};
            });
        }

        if (typeof setter === 'function') {
            service.getCharacteristic(characteristic).on('set', async (value, callback) => {
				try {
					await setter(value);
				}
				catch(error) {
					this.log(error);
				}
				finally {
					callback();
				}
            });
    
        }

    }	
	
	evaluate(code, args = {}) {       
		// Call is used to define where "this" within the evaluated code should reference.
		// eval does not accept the likes of eval.call(...) or eval.apply(...) and cannot
		// be an arrow function
		return function () {
			// Create an args definition list e.g. "arg1 = this.arg1, arg2 = this.arg2"
			const argsStr = Object.keys(args).map(key => `${key} = this.${key}`).join(',');
			const argsDef = argsStr ? `let ${argsStr};` : '';
	
			return eval(`${argsDef}${code}`);
		}.call(args);
	}


	enableOnOff(service) {
		var config = this.config['onoff'];
		var characteristic = this.getService(service).getCharacteristic(Characteristic.On);

		if (config) {
			this.onoff = characteristic.value;

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



	enableBrightness(service) {
		var config = this.config['brightness'];
		var characteristic = this.getService(service).getCharacteristic(Characteristic.Brightness);

		if (config) {
			var {get:getTopic, set:setTopic, minValue = 0, maxValue = 100} = config;

			this.brightness = characteristic.value;

			characteristic.on('get', (callback) => {
				callback(null, this.brightness);
            });

			characteristic.on('set', (value, callback) => {

				this.brightness = value;

				// Convert to factor (0-1)
				value = (value - characteristic.props.minValue) / (characteristic.props.maxValue - characteristic.props.minValue);
				value = value * (maxValue - minValue) + minValue;

				if (setTopic)
					this.platform.publish(setTopic, value);

				callback();

			});
			
			if (getTopic) {
				this.on(getTopic, (value) => {
					value = (value - minValue) / (maxValue - minValue);
					value = value * (characteristic.props.maxValue - characteristic.props.minValue) + characteristic.props.minValue;
	
					this.debug(`Brightness ${getTopic}:${value}`);
					characteristic.updateValue(value);	

					this.brightness = value;
				});				
	
				this.platform.subscribe(getTopic);
	
			}
		}
	}


	enableColorTemperature(service) {

		var {get:getTopic, set:setTopic, minValue = 0, maxValue = 100} = this.config['color-temperature'] || {};

		if (getTopic) {
			var characteristic = this.getService(service).getCharacteristic(Characteristic.ColorTemperature);

			this.colorTemperature = characteristic.value;
	
			var getter = async () => {
				return this.colorTemperature;
			}
	
			var setter = async (value) => {
				try {
					this.log(`Setting color temperature to ${value}`);
					this.colorTemperature = value;

					// Convert to factor (0-1)
					value = (value - characteristic.props.minValue) / (characteristic.props.maxValue - characteristic.props.minValue);

					// Convert to mqtt value
					value = value * (maxValue - minValue) + minValue;

					this.platform.publish(setTopic, JSON.stringify(value));
		
				}
				catch (error) {
					this.log(error);
				}
		
			};
	
			this.enableCharacteristic(service, Characteristic.ColorTemperature, getter, setter);		
	
			this.on(getTopic, (value) => {
				value = (value - minValue) / (maxValue - minValue);
				value = value * (characteristic.props.maxValue - characteristic.props.minValue) + characteristic.props.minValue;
	
				this.colorTemperature = value;

				this.debug(`ColorTemperature:${getTopic}:${this.colorTemperature}`);
				this.updateCharacteristicValue(service, Characteristic.ColorTemperature, this.colorTemperature);	
			});				

			this.platform.subscribe(getTopic);
		}	
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


};


/*





				*/