"use strict";


module.exports = class Platform {

    constructor(log, config, homebridge) {

        this.config = config;
        this.log = log;
        this.homebridge = homebridge;
        this.debug = config.debug ? log : () => {};

        this.homebridge.on('didFinishLaunching', () => {
            this.debug('Finished launching.');
        });
        
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

		callback(accessories);
    }


    generateUUID(id) {
        return this.homebridge.hap.uuid.generate(id.toString());
    }

}
