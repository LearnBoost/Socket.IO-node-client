
/*!
 * socket.io-node-client
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;

/**
 * Evented streaming decoder.
 *
 * @api public
 */

var Decoder = exports.Decoder = function (str) {
  this.str = str || '';
};

/**
 * Inherits from EventEmitter.
 */

Decoder.prototype.__proto__ = EventEmitter.prototype;

/**
 * Adds a string to decode
 *
 * @param {String} str
 * @api public
 */

Decoder.prototype.add = function (str) {
  this.str += str;
  this.decode();
};

/**
 * Decode
 *
 * @api private
 */

Decoder.prototype.decode = function () {
  if ('number' != typeof this.length) {
    for (var i = 0, l = this.str.length, c; i < l; i++) {
      c = this.str[i];

      if (i == 0) {
        if (c == '\ufffd')
          this.length = '';
        else {
          this.message(this.str)
          this.str = '';
          return this;
        }
      }

      else if (i > 0) {
        if (c == '\ufffd') {
          this.str = this.str.substr(i + 1);
          this.length = Number(this.length);
          this.decode();
        } else {
          this.length += c;
        }
      }
    }
  } else {
    if (this.str.length >= this.length) {
      this.message(this.str.substr(0, this.length));
      this.str = this.str.substr(this.length);
      this.length = null;
      this.decode();
    }
  }
};

/**
 * Parses a message
 *
 * @api private
 */

Decoder.prototype.message = function (msg) {
  var parts = msg.split(':');

  if (parts.length < 3)
    return this.error('Bad message');

  this.emit.apply(this, ['message'].concat(parts));
};


/**
 * Fires an error event and clears state
 *
 * @api private
 */

Decoder.prototype.error = function (err) {
  this.emit('error', err);
  this.length = null;
  this.str = '';
};

/**
 * Message batch encoder
 *
 * @api public
 */

exports.encodeBatch = function (arr) {
  var str = '';

  for (var i = 0, l = arr.length; i < l; i++)
    str += '\ufffd' + arr[i].length + '\ufffd' + arr[i];

  return str;
};

