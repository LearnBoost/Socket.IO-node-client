
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
 * JSONP Polling transport constructor
 *
 * @api public
 */

var JSONPPolling = module.exports = function (uri, options) {
  HTTPClient.call(this, uri, options);
};

/**
 * Inherits from HTTPClient.
 */

JSONPolling.prototype.__proto__ = HTTPClient.prototype;

/**
 * Transport name
 *
 * @api public
 */

JSONPolling.prototype.name = 'jsonp-polling';
