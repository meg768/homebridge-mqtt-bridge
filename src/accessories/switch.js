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

		var {topic, get:getTopic, set:setTopic} = this.config['onoff'];

		if (topic) {
			getTopic = setTopic = topic;
		}

		this.onoff = false;

		var getter = async () => {
			return this.onoff;
		}

		var setter = async (value) => {
			try {
				this.onoff = value ? true : false;

				if (setTopic) 
					this.platform.publish(setTopic, this.onoff);
	
			}
			catch (error) {
				this.log(error);
			}
	
		};

		this.enableCharacteristic(service, Characteristic.On, getter, setter);		

		if (getTopic) {
			this.on(getTopic, (value) => {
				this.onoff = value;
	
				this.debug(`OnOff:${getTopic}:${this.onoff}`);
				this.updateCharacteristicValue(service, Characteristic.On, this.onoff);	
			});				

			this.platform.subscribe(getTopic);
		}		
	}

}

