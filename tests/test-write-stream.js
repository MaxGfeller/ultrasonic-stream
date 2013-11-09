'use strict';

var fs = require('fs');

var ultrasonic = new (require('../index.js'))({
	freqMin: 200,
	freqMax: 600,
	toneLength: 0.5
});

var writeStream = ultrasonic.createWriteStream();

writeStream.write('Hello');
writeStream.write('World');
writeStream.write('What');
writeStream.write('the');
writeStream.write('fuck');
writeStream.write('is');
writeStream.write('going');
writeStream.write('on');

writeStream.end();
