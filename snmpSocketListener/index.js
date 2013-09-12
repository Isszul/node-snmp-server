
var events = require('events');
var dgram = require('dgram');
var asn1ber = require('../lib/asn1ber.js');
var snmp = require('../lib/snmp.js');

function convertOID(oid) {

    var output = ".";

    for (var i=0; i<oid.length; i++) {
        output = output + oid[i];
        if (i<oid.length-1) {
            output = output + "."
        }
    }
    return output;

}


function SnmpSocketListener(port, nosql) {

    Nosql = nosql;
    this.socket = dgram.createSocket('udp4');
    this.socket.bind(port);

    this.socket.on('message', this.messageRecieved);
    
}

SnmpSocketListener.prototype = new events.EventEmitter();

SnmpSocketListener.prototype.messageRecieved = function (msg, rinfo) {

    var oid = convertOID(snmp.parse(msg)['pdu']['varbinds'][0]['oid']);

    Nosql.all("doc.oid == '"+oid+"'", function (doc, offset) {

        console.log(doc);

    });
}


exports.init = function (port, nosql) {
    return new SnmpSocketListener(port, nosql);
}