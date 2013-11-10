'use strict';

var exec = require('child_process').exec;
var base64encode = require('base64-encode');
var Stream = require('stream');


var ultrasonic = function() {
	this.startChar = '^';
	this.endChar = '$';
	this.initTransferChar = '?';
	this.endTransferChar = '*';
	this.charList = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';
	this.toneLength = 0.03;
	this.freqMin = 18000;
	this.freqMax = 20000;
	this.chunkSize = 8;

	// append special characters to charList
	this.charList = this.startChar + this.initTransferChar + this.charList + this.endChar + this.endTransferChar;
}

ultrasonic.prototype.configure = function(opts) {
	var possibleOpts = ['startChar', 'endChar', 'initTransferChar', 'endTransferChar', 'charList', 'toneLength', 'freqMin', 'freqMax', 'chunkSize'];

	for(var i = 0; i < possibleOpts.length; i++) {
		var opt = possibleOpts[i];

		if(opts[opt]) {
			this[opt] = opts[opt];
		}
	}
}

ultrasonic.prototype._charToFreq = function(char) {
	var index = this.charList.indexOf(char);

	if(index === -1) {
		console.error('char ', char, ' is not in charList');
		return;
	}

	var freqRange = this.freqMax - this.freqMin;
	var percent = index / this.charList.length;
	var freqOffset = Math.round(freqRange * percent);

	return this.freqMin + freqOffset;
}

ultrasonic.prototype.sendString = function(str, cb) {
	var currentIndex = 0;
	// TODO: base64
	var str = this.startChar + str + this.endChar;

	console.log(str);

	var playChar = function() {
		if(currentIndex === str.length) return cb();
		this.sendChar(str[currentIndex], playChar);
		currentIndex++;
	}.bind(this);

	playChar();
}

ultrasonic.prototype.sendChar = function(char, cb) {
	var freq = this._charToFreq(char);
	var cmd = 'play -n synth ' + this.toneLength + ' sin ' + freq;

	console.log(char);


	exec(cmd, function(err, stdout, stderr) {
      cb();
    });
}

ultrasonic.prototype.createReadStream = function() {
	console.error('not yet implemented');
}

ultrasonic.prototype.createWriteStream = function() {
	var stream = new Stream();
	stream.writable = true;
	stream.readable = false;
	stream.paused = false;
	stream.sentStartChar = false;
	stream.processing = false;
	stream.queue = [];

	var us = this;

	stream.write = function(data) {
		if(!this.sentStartChar) {
			this.queue.push(us.sendChar.bind(us, us.initTransferChar));
		}

		// TODO: split into chunks
		this.queue.push(us.sendString.bind(us, data));

		if(!this.processing) {
			this.processQueue();
			this.processing = true;
		}
	}

	stream.end = function() {
		this.queue.push(us.sendChar.bind(us, us.endTrasferChar));
		if(!this.processing) {
			this.processQueue();
			this.processing = true;
		}
	}

	stream.processQueue = function() {
		console.log('processing queue');

		if(this.queue.length === 0) {
			this.processing = false;
			return;
		}

		var func = this.queue.pop();
		func(this.processQueue.bind(this));
	}

	return stream;
}

module.exports = new ultrasonic();