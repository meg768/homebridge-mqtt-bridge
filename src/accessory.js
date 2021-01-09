var {API, Service, Characteristic} = require('./homebridge.js');



module.exports = class extends API.platformAccessory  {

    constructor(options) {
        var {log, debug, config, name, platform} = options;

		if (config == undefined)
			throw new Error('A configuration of the accessory must be specified.');

		if (platform.config.name == undefined)
			throw new Error('The platform must have a name.');

		if (name == undefined)
			name = config.name;

        if (name == undefined)
            throw new Error('A name of the accessory must be specified.');

		var uniqueName = `${platform.config.name}-${name}`;
		var uuid = API.hap.uuid.generate(uniqueName);

		super(uniqueName, uuid);

		this.name = name;

		// Apparently we need a display name...
		this.displayName = name;

		// Seems like we have to set the uuid_base member to a unique ID to have several platforms with accessories with the same name
		this.uuid_base = uuid;

		// What do I know, but this is set also...
		this.UUID = uuid;
		this.uuid = uuid;
		
		this.platform = platform;
		this.config = config;
		this.log = log;
		this.debug = debug;

		this.updateCharacteristicValue(Service.AccessoryInformation, Characteristic.FirmwareRevision, "1.0");

	}


	getServices() {
		return this.services;
	}
	
	pause(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }
    
    updateCharacteristicValue(service, characteristic, value) {
        this.getService(service).getCharacteristic(characteristic).updateValue(value);
    }

	addCharacteristic(service, characteristic, setter, getter) {

		var ctx = service.getCharacteristic(characteristic);

		ctx.on('get', (callback) => {
			getter().then((value) => {
				callback(null, value);
			})
			.catch((error) => {
				this.log(error);
				callback();
			});
        });

        ctx.on('set', (value, callback) => {

			setter(value).then(() => {
			})
			.catch((error) => {
				this.log(error);
			})
			.then(() => {
				callback();
			})
		});
	}




};
