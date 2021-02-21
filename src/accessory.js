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
	


};
