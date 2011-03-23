
/*!
 * socket.io-node-client
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

const Client = require('./client')
    , http = require('http')
    , https = require('https');

/**
 * HTTP Client constructor.
 * Abstraction for unidirectional HTTP clients (all but WebSocket)
 *
 * @api public
 */

var HTTPClient = module.exports = function (uri, options) {
  Client.call(this, uri, options);
};

/**
 * Inherits from Client
 */

HTTPClient.prototype.__proto__ = Client.prototype;

/**
 * Endpoint URL getter
 *
 * @api public
 */

HTTPClient.prototype.__defineGetter__('url', function () {
  return (this.secure ? 'https' : 'http') + '://' + this.host + this.path;
});

/**
 * Setup connection logic
 *
 * @api private
 */

HTTPClient.prototype.setup = function () {
  this.request();
};

/**
 * Initializes a GET request
 *
 * @param text
 */

HTTPClient.prototype.request = function () {
  var self;

  function response (res) {
    res.on('data', function (data) {
      self.decoder.add(data);
    });

    res.on('end', function () {
      self.request();
    });
  };

  var request = (this.secure ? https : http).request({
      host: this.host
    , port: this.port
    , method: 'GET'
    , path: '/
    , headers: {
          'Connection': 'Keep-Alive'
        , 'User-Agent': 'Socket.IO Node.JS Client'
      }
  }, response)

  request.on('error', function () {
    // debug: GET request error
    self.close();
  });

  request.end();
};

/**
 * Close connection logic
 *
 * @param {Function} callback
 * @api private
 */

HTTPClient.prototype.teardown = function (fn) {
  this.connection.end();
};

/**
 * Writes buffered packets
 *
 * @api private
 */

HTTPClient.prototype.writeBuffer = function () {
  // this is wrong, we need to go through the packets and collect the callbacks
  this.write(encoding.encodeBatch(this.bufferedPackets));
  this.bufferedPackets = [];
};

/**
 * Sends a POST request with the data
 *
 * @api private
 */

HTTPClient.prototype.doWrite = function (data, fn) {
  function response (res) {
    res.on('end', function () {
      
    });
  }
  var request = (this.secure ? https : http).request({
      'Connection': 'Keep-Alive'
    , 'User-Agent': 'Socket.IO Node.JS Client'
  }, response);

  request.on('error', function () {
    // debug: POST request error
  }):

  request.end();
};

HTTPClient.prototype.write = HTTPClient.prototype.doWrite;
HTTPClient.prototype.writeACK = HTTPClient.prototype.doWrite;

