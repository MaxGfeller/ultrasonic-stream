'use strict';
var ultrasonic = require('../index.js');

ultrasonic.configure({
	freqMin: 200,
	freqMax: 600
});

ultrasonic.sendString('Hello World', function() {
	console.log('sent string');
});
