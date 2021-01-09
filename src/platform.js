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
			'switch': require('./accessories/switch.js')
		}

        var accessories = [];

        this.debug(`Creating accessories...`);
        this.config.accessories.forEach((config, index) => {

			var Accessory = Accessories[config.type];

			if (Accessory != undefined)
	            accessories.push(new Accessory({config:config, platform:this, log:this.log, debug:this.debug, homebridge:this.homebridge}));
		});
		
		this.mqtt.on('connect', () => {
			this.debug(`Connected to MQTT broker ${this.config.host}`);
		});
        

		callback(accessories);
    }


    generateUUID(id) {
        return this.homebridge.hap.uuid.generate(id.toString());
    }

}
