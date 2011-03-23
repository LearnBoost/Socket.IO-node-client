
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
 * HTMLFile transport constructor
 *
 * @api public
 */

var HTMLFile = module.exports = function (uri, options) {
  HTTPClient.call(this, uri, options);
};

/**
 * Inherits from HTTPClient.
 */

HTMLFile.prototype.__proto__ = HTTPClient.prototype;

/**
 * Transport name
 *
 * @api public
 */

HTMLFile.prototype.name = 'htmlfile';
