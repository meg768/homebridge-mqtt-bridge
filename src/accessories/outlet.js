var {Service, Characteristic} = require('../homebridge.js')
var Accessory = require('../accessory.js');

module.exports = class Outlet extends Accessory {

    constructor(options) {

		var service = Service.Outlet;

		super(options);
		
		this.addService(new service(this.name, this.UUID));
		this.enableOnOff(service);
    }



}

