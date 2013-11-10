'use strict';

var fs = require('fs');
var ultrasonic = require('../index.js');

ultrasonic.configure({
	freqMin: 16000,
	freqMax: 19000,
	toneLength: 0.04
});

var writeStream = ultrasonic.createWriteStream();

writeStream.write('Hello');
writeStream.write('World');
writeStream.write('one');
writeStream.write('two');
writeStream.write('three');

setTimeout(function() {
	writeStream.write('four');
	writeStream.end();
}, 8000);

