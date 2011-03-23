
/**
 * Module dependencies.
 */

var mini = require('socket.io-node-client')
  , should = require('should');

module.exports = {
  'test .version': function(){
    socket.io-node-client.version.should.match(/^\d+\.\d+\.\d+$/);
  }
};