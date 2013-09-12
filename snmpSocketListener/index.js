

var events = require('events');
var dgram = require('dgram');
var snmpPacketParser = require('../snmpPacketParser');


function SnmpSocketListener(port) {

    this.socket = dgram.createSocket('udp4');
    this.socket.bind(port);

    this.socket.on('message', this.messageRecieved);
    
}

SnmpSocketListener.prototype = new events.EventEmitter();

SnmpSocketListener.prototype.messageRecieved = function (msg, rinfo) {

    console.log(msg);
    parsedPacket = snmpPacketParser.parsePacket(msg);

    console.log(parsedPacket["OBJECT_IDENTIFIER_VALUE"]);


}


exports.init = function (port) {
    return new SnmpSocketListener(port);
}