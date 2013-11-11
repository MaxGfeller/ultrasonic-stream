'use strict';

var ultrasonic = require('../index.js');

ultrasonic.configure({
	freqMin: 200,
	freqMax: 600
}); 

// ultrasonic.sendChar('a', function() {
// 	console.log('sent');
// });

var charList = 'abcdefghijklmnopqrstuvwxyz';
var currentIndex = 0;

var playChar = function() {
	if(currentIndex === charList.length) return;

	ultrasonic.sendChar(charList[currentIndex], playChar);
	currentIndex++;
}

playChar();
