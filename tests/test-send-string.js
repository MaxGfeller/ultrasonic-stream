'use strict';

var ultrasonic = new (require('../index.js'))({
	freqMin: 200,
	freqMax: 600
});

ultrasonic.sendString('Hello World', function() {
	console.log('sent string');
});