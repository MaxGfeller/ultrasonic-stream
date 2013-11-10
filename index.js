'use strict';

var exec = require('child_process').exec;
var base64encode = require('base64-encode');
var Stream = require('stream');

var Ultrasonic = function() {
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

Ultrasonic.prototype.configure = function(opts) {
	var possibleOpts = [
		'startChar',
		'endChar',
		'initTransferChar',
		'endTransferChar',
		'charList',
		'toneLength',
		'freqMin',
		'freqMax',
		'chunkSize'
	];

	for(var i = 0; i < possibleOpts.length; i++) {
		var opt = possibleOpts[i];

		if(opts[opt]) {
			this[opt] = opts[opt];
		}
	}
}

Ultrasonic.prototype._charToFreq = function(char) {
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

Ultrasonic.prototype.sendString = function(str, cb) {
	var currentIndex = 0;
	
	var str = this.startChar + base64encode(str) + this.endChar;

	var playChar = function() {
		if(currentIndex === str.length) return cb();

		this.sendChar(str[currentIndex], playChar);
		currentIndex++;
	}.bind(this);

	playChar();
}

Ultrasonic.prototype.sendChar = function(char, cb) {
	var freq = this._charToFreq(char);
	var cmd = 'play -n synth ' + this.toneLength + ' sin ' + freq;

	exec(cmd, function(err, stdout, stderr) {
      cb();
    });
}

Ultrasonic.prototype.createReadStream = function() {
	console.error('not yet implemented');
}

Ultrasonic.prototype.createWriteStream = function() {
	var stream = new Stream();

	stream.writable = true;
	stream.readable = false;
	stream.paused = false;
	stream.sentStartChar = false;
	stream.processing = false;
	stream.queue = [];
	stream.us = this;

	stream.write = function(data) {
		if(!this.sentStartChar) {
			this.sentStartChar = true;

			this.queue.push(this.us.sendChar.bind(this.us, this.us.initTransferChar));
		}

		// TODO: split into chunks
		this.queue.push(this.us.sendString.bind(this.us, data));

		if(!this.processing) {
			setTimeout(this.processQueue.bind(this), 0);
			this.processing = true;
		}
	}

	stream.end = function() {
		this.queue.push(this.us.sendChar.bind(this.us, this.us.endTransferChar));
		if(!this.processing) {
			setTimeout(this.processQueue.bind(this), 0);
			this.processing = true;
		}
	}

	stream.processQueue = function() {
		if(this.queue.length === 0) {
			this.processing = false;
			return;
		}

		var func = this.queue.shift();
		func(this.processQueue.bind(this));
	}

	return stream;
}

module.exports = new Ultrasonic();