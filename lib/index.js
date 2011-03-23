
/*!
 * socket.io-node-client
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

const transports = {
    'websocket': require('./transports/websocket')
  , 'htmlfile': require('./transports/htmlfile')
  , 'xhr-polling': require('./transports/xhr-polling')
  , 'xhr-multipart': require('./transports/xhr-multipart')
  , 'jsonp-polling': require('./transports/jsonp-polling')
};

/**
 * Creates a client
 *
 * @param {String} transport name (defaults to websocket, optional)
 * @param {String} url
 * @param {Object} options
 * @return {Client}
 */

exports.createClient = function (transport, url, options) {
  // initialize options
  if ('string' != typeof url) {
    options = url;
    url = transport;
    transport = null;
  }

  options = options || {};

  // initialize transport
  var transport = new transports[transport || 'websocket'](url, options);

  if (options.autoConnect || undefined == options.autoConnect)
    transport.connect();

  return transport;
};

/**
 * Defines a transport
 *
 * @param {String} transport name
 * @param {Client} transport
 */

exports.defineTransport = function (transport, ctor) {
  transports[transport] = ctor;
  return exports;
};

/**
 * Library version.
 */

exports.version = '0.0.1';
