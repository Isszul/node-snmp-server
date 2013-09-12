

var events = require('events');
var dgram = require('dgram');



function SnmpSocketListener(port) {

    this.socket = dgram.createSocket('udp4');
    this.socket.bind(port);

    this.socket.on('message', this.messageRecieved);
    
}

SnmpSocketListener.prototype = new events.EventEmitter();

SnmpSocketListener.prototype.messageRecieved = function (msg, rinfo) {

    console.log(msg);

}


exports.init = function (port) {
    return new SnmpSocketListener(port);
}