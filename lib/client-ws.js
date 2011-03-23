
/*!
 * socket.io-node-client
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

const Client = require('./client')
    , WebSocket = require('websocket-client');

/**
 * WebSocket Client constructor.
 *
 * @api public
 */

var WSClient = module.exports = function (uri, options) {
  Client.call(this, uri, options);
};

/**
 * Inherits from Client
 */

WSClient.prototype.__proto__ = Client.prototype;

/**
 * Endpoint URL getter
 *
 * @api private
 */

WSClient.prototype.__defineGetter__('url', function () {
  return (this.secure ? 'wss' : 'ws') + '://' + this.host + this.path;
});

/**
 * Determines if transport should buffer ongoing messages
 *
 * @api private
 */

WSClient.prototype.__defineGetter__('shouldBuffer', function () {
  return this.connectionState != 1;
});

/**
 * Setup connection logic
 *
 * @api private
 */

WSClient.prototype.setup = function () {
  this.client = new WebSocket(this.url);
  this.connection = this.client.socket;
  this.client.onopen = this.onOpen.bind(this);
  this.client.onclose = this.onClose.bind(this);
};

/**
 * Close connection logic
 *
 * @api private
 */

WSClient.prototype.teardown = function () {
  this.client.close();
};

/**
 * Writes buffered packets
 *
 * @api private
 */

WSClient.prototype.writeBuffer = function () {
  while (var packet = this.bufferedPackets.shift())
    this.writePacket.apply(this, packet);
};

