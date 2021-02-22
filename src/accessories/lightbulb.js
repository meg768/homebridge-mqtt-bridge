var {Service, Characteristic} = require('../homebridge.js')
var Switch = require('./switch.js');
var Accessory = require('../accessory.js');

module.exports = class Lightbulb extends Accessory {

    constructor(options) {
		super(options);
		
		this.addService(new Service.Lightbulb(this.name, this.UUID));
		this.enableOnOff(Service.Lightbulb);
		this.enableBrightness(Service.Lightbulb);
		this.enableColorTemperature(Service.Lightbulb);
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


	enableBrightness(service) {
		var config = this.config['brightness'];
		var characteristic = this.getService(service).getCharacteristic(Characteristic.Brightness);

		if (config) {
			var {get:getTopic, set:setTopic, minValue = 0, maxValue = 100} = config;

			this.brightness = characteristic.getDefaultValue();

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



}

