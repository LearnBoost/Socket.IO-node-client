
/*!
 * socket.io-node-client
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

const EventEmitter = require('events').EventEmitter
    , encoding = require('./encoding')
    , Decoder = encoding.Decoder;

/**
 * Client constructor
 *
 * @param {String} url
 * @param {Object} options
 * @api public
 */

var Client = module.exports = function (uri, options) {
  this.uri = uri;
  this.parsedUri = url.parse(uri);
  this.options = options || {};
  this.bufferedPackets = [];
  this.decoder = new Decoder;
  this.decoder.on('data', this.onData.bind(this));
};

/**
 * Inherits from EventEmitter.
 */

Client.prototype.__proto__ = EventEmitter.prototype;

/**
 * Protocol version the client implements
 *
 * @api public
 */

Client.prototype.protocolVersion = 1;

/**
 * ReadyState
 *
 *  - 0: disconnected
 *  - 1: connected
 *  - 2: connecting
 *  - 3: disconnecting
 *
 * @api public
 */

Client.prototype.readyState = 0;

/**
 * Connection state
 *
 *  - 0: closed
 *  - 1: open
 *  - 2: opening
 *  - 3: closing
 *
 * @api public
 */

Client.prototype.connectionState = 0;

/**
 * Session ID (if handshaken)
 *
 * @api public
 */

Client.prototype.sessionId;

/**
 * Server hearbeat timeout (if handshaken)
 *
 * @api private
 */

Client.prototype.heartbeatTimeout;

/**
 * Server close timeout if handshaken)
 *
 * @api private
 */

Client.prototype.closeTimeout;

/**
 * Endpoint path getter
 *
 * @api public
 */

Client.prototype.__defineGetter__('path', function () {
  return '/' + this.protocolVersion + '/' + this.name + '/' + this.sessionId;
});

/**
 * Connect method
 *
 * @param {Function} optional callback
 */

Client.prototype.connect = function (fn) {
  if (this.readyState != 0)
    throw new Error('Trying to connect but the client is not disconnected');

  this.readyState = 2;

  this.emit('connecting');
  this.once('connect', fn);

  var self = this;
  this.handshake(function (err) {
    if (err) {
      // debug: handshake error
      return self.emit('error', err);
    }
    
    // debug: setting up connection
    this.open(function () {
      self.readyState = 1;
      self.emit('connect');
    });
  });

  return this;
};

/**
 * Open connection
 *
 * @api private
 */

Client.prototype.open = function (fn) {
  if (this.connectionState != 0)
    throw new Error('Trying to open but the connection is not closed.');

  // debug: opening connection
  this.connectionState = 2;
  this.emit('opening');
  this.once('open', fn);

  // debug: setting up connection
  this.setup();

  this.connection.on('close', this.onClose.bind(this));
  this.connection.on('error', this.close.bind(this));

  return this;
};

/**
 * Called when the connection is closed
 *
 * @api private
 */

Client.prototype.onOpen = function () {
  // debug: connection opened
  this.connectionState = 1;
  this.emit('open');

  if (this.closeTimer) {
    // debug: clearing close timer
    clearTimeout(this.closeTimer);
    this.closeTimer = null;
  }

  // debug: setting up heartbeats
  this.heartbeatTimer = setTimeout(, this.heartbeatTimeout - this.options.heartbeat);
};

/**
 * Close connection
 *
 * @api private
 */

Client.prototype.close = function (fn) {
  if (this.connectionState != 1)
    throw new Error('Trying to close but the connection is open');

  // debug: closing connection
  this.connectionState = 3;
  this.emit('closing');
  this.once('close', fn);

  // debug: tearing down connection
  this.teardown();

  return this;
};

/**
 * Called when the connection is closed
 *
 * @api private
 */

Client.prototype.onClose = function () {
  if (this.connectionState == 0) {
    // debug: attempting to close connection twice
    return;
  }

  // debug: connection closed
  this.connectionState = 0;

  this.connection.destroy();
  this.connection = null;

  // debug: clearing heartbeat timeout
  clearTimeout(this.heartbeatTimer);
  this.heartbeatTimer = null;

  if (this.readyState == 1) {
    // debug: attempt re-open
    this.open();

    // debug: close timer, will disconnect in {this.closeTimeout}
    this.closeTimer = setTimeout(this.onDisconnect.bind(this), this.closeTimeout);
  }

  this.emit('close');
};

/**
 * Performs the handshake
 *
 * @param {Function} callback
 * @api private
 */

Client.prototype.handshake = function (fn) {
  var self = this
    , called = false
    , str = ''
    , request = (this.secure ? https : http).request({
          host: this.host
        , port: this.port
        , path: '/' + this.name + '/' + this.protocolVersion
        , method: 'POST'
      }, function (res) {
        res.on('data', function (str) {
          data += str;
        });

        res.on('error', function () {
          complete(new Error('Bad handshake response'));
        });

        res.on('end', function () {
          if (res.statusCode == 200) {
            var pieces = data.split(':');

            if (3 != pieces.length)
              return complete(new Error('Bad handshake response data'));

            self.sessionId = pieces[0];
            self.heartbeatTimeout = pieces[1];
            self.closeTimeout = pieces[2];

            self.emit('handshake', pieces[0], pieces[1], pieces[2]);

            complete(null);
          }
        });
      });

  function complete (err, data) {
    if (called) return;
    fn(err, data);
    called = true;
  };

  request.on('error', function () {
    complete(new Error('Handshake error'));
  });
};

/**
 * Send a message
 *
 * @param {Object} message
 * @param {Function} a function, if ACK is required
 * @api public
 */

Client.prototype.send = function (msg) {
  if (msg.constructor == Object)
    return this.sendJSON(msg);

  return this.writePacket(3, msg);
};

/**
 * Sends a JSON encoded message
 *
 * @api public
 */

Client.prototype.sendJSON = function (obj) {
  this.writePacket(4, JSON.stringify(obj));
  return this;
};

/**
 * Writes a packet to the socket
 *
 * @param {String} message type
 * @param {String} message
 * @api private
 */

Client.prototype.writePacket = function (messageType, message, endpoint, callback) {
  encoding = encoding || '/';

  // check ready state for throwing
  if (this.readyState != 1)
    throw new Error('Socket is disconnected');
  
  // check connection state for buffering
  if (this.shouldBuffer)
    return this.buffer(arguments);

  // otherwise
  if (callback)
    this.writeACK(encoding.encode(messageType, message));
  else 
    this.write(encoding.encode(messageType, message));

  return this;
};

/**
 * Buffers a packet
 *
 * @api public
 */

Client.prototype.buffer = function () {
  this.bufferedPackets.push(arguments);
  return this;
};

/**
 * Writes to the server
 *
 * @abstract
 * @api private
 */

Client.prototype.write = function () {
  throw new Error('Unimplemented');
};

/**
 * Flushes the buffered packets
 *
 * @abstract
 * @api private
 */

Client.prototype.writeBuffer = function () {
  throw new Error('Unimplemented');
};

/**
 * Handle incoming messages from server
 *
 * @api private
 */

Client.prototype.onData = function (data) {
  var message = encoding.decodeMessage()
};

/**
 * Disconnect method
 *
 * @param {Function} optional callback
 */

Client.prototype.disconnect = function () {
  if (this.readyState == 0)
    throw new Error('Trying to disconnect but the client is already disconnected');

  this.readyState = 3;
  this.emit('disconnecting');
  this.once('disconnect', fn);

  var self = this;

  this.doDisconnect(function () {
    self.readyState = 0;
    self.emit('disconnect');
  });

  return this;
};

/**
 * Creates a sub-socket for a particular namespace
 *
 * @param text
 */

Client.prototype.namespace = function (nsp) {
  if (!(nsp in this.namespaces)
    this.namespaces[nsp] = new Client.Namespace(nsp);

  return this.namespaces[nsp];
};

/**
 * Client namespace
 * A "fake" socket that lives in the original socket.
 *
 * @param {Client} client
 * @param {String} name
 * @api public
 */

Client.Namespace = function (client, name) {
  this.client = client;
  this.name = name;
};

/**
 * Inherits from EventEmitter
 */

Client.prototype.__proto__ = EventEmitter.prototype;
