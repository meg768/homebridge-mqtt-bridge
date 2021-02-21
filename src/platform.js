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
		
		var Accessories = {
			'switch': require('./accessories/switch.js'),
			'lightbulb': require('./accessories/lightbulb.js'),
			'motion-sensor': require('./accessories/motion-sensor.js'),
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
