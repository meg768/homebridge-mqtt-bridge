"use strict";


class App {

    constructor() {
		var MQTT = require('mqtt');

		

		this.mqtt = MQTT.connect('mqtt://pi-mqtt', {username:'meg768', password:'potatismos'});

				
		this.mqtt.on('connect', () => {
			console.log('Connected');
		});

		this.mqtt.on('message', (topic, message) => {

			console.log(topic);
			console.log(message.toString());
		});

		this.mqtt.subscribe('homey/devices/6139f3d1-662e-4b1d-9332-cfa5703790ee/capability/onoff')

    }



}

new App();