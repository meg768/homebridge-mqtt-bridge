"use strict";


module.exports = class Platform {

    constructor(log, config, homebridge) {
		var mqtt = require('mqtt');

        this.config = config;
        this.log = log;
        this.homebridge = homebridge;
        this.debug = config.debug ? log : () => {};

        this.homebridge.on('didFinishLaunching', () => {
            this.debug('Finished launching.');
		});
		

		this.debug(`Connecting to MQTT broker ${this.config.host}...`);
		this.mqtt = mqtt.connect(this.config.host, {username:this.config.username, password:this.config.password});

    }




    accessories(callback) {
		

		function evaluate(code, args = {}) {       
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

		var Accessories = {
			'switch': require('./accessories/switch.js'),
			'lightbulb': require('./accessories/lightbulb.js'),
			'motion-sensor': require('./accessories/motion-sensor.js'),
			'outlet': require('./accessories/outlet.js'),
			'temperature-sensor': require('./accessories/temperature-sensor.js')
		}

        var accessories = [];

        this.debug(`Creating accessories...`);
        this.config.accessories.forEach((config, index) => {

			var Accessory = Accessories[config.type];

			if (Accessory != undefined)
	            accessories.push(new Accessory({config:config, platform:this}));
		});
		
		this.mqtt.on('connect', () => {
			this.debug(`Connected to MQTT broker ${this.config.host}`);
			callback(accessories);
		});

		this.mqtt.on('message', (topic, message) => {

			try {
				var payload = JSON.parse(message.toString());

				accessories.forEach((accessory) => {
					accessory.emit(topic, payload);
				});		
			}
			catch (error) {
				this.log(error);
			}
		});

    }

	subscribe(topic) {
		this.debug(`Subscribing to topic '${topic}...`);
		this.mqtt.subscribe(topic);		
	}

	publish(topics, value) {
		if (typeof value != 'string')
			value = JSON.stringify(value);

		if (!(topics instanceof Array)) {
			topics = [topics]
		}

		topics.forEach((topic) => {
			this.debug(`Publishing ${value} to topic '${topic}...`);
			this.mqtt.publish(topic, value, {retain:true});	
		});
	}

	generateUUID(id) {
        return this.homebridge.hap.uuid.generate(id.toString());
    }

}
