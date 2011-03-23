
/*!
 * socket.io-node-client
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

const WebSocketClient = require('../client-ws');

/**
 * WebSocket transport constructor
 *
 * @api public
 */

var WebSocket = module.exports = function (uri, options) {
  WebSocketClient.call(this, uri, options);
};

/**
 * Inherits from WebSocketClient.
 */

WebSocket.prototype.__proto__ = WebSocketClient.prototype;

/**
 * Transport name
 *
 * @api public
 */

WebSocket.prototype.name = 'websocket';
