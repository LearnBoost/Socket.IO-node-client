
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
 * XHRMultipart transport constructor
 *
 * @api public
 */

var XHRMultipart = module.exports = function (uri, options) {
  HTTPClient.call(this, uri, options);
};

/**
 * Inherits from HTTPClient.
 */

XHRMultipart.prototype.__proto__ = HTTPClient.prototype;

/**
 * Transport name
 *
 * @api public
 */

XHRMultipart.prototype.name = 'xhr-multipart';
