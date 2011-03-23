
/*!
 * socket.io-node-client
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

const WebSocketTransport = require('./websocket');

/**
 * FlashSocket transport constructor
 *
 * @api public
 */

var FlashSocket = module.exports = function (uri, options) {
  WebSocketTransport.call(this, uri, options);
};

/**
 * Inherits from WebSocketTransport.
 */

FlashSocket.prototype.__proto__ = WebSocketTransport.prototype;

/**
 * Transport name
 *
 * @api public
 */

FlashSocket.prototype.name = 'flashsocket';
