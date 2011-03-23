
/*!
 * socket.io-node-client
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

const HTTPClient = require('../client-http');

/**
 * XHRPolling transport constructor
 *
 * @api public
 */

var XHRPolling = module.exports = function (uri, options) {
  HTTPClient.call(this, uri, options);
};

/**
 * Inherits from HTTPClient.
 */

XHRPolling.prototype.__proto__ = HTTPClient.prototype;

/**
 * Transport name
 *
 * @api public
 */

XHRPolling.prototype.name = 'xhr-polling';
