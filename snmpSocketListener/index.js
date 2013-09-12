
var events = require('events');
var dgram = require('dgram');
var asn1ber = require('../lib/asn1ber.js');
var snmp = require('../lib/snmp.js');


function convertOIDToString(oid) {
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

    this.nosql = nosql;
    this.socket = dgram.createSocket('udp4');
    this.socket.bind(port);

    this.socket.on('message', this.messageRecieved.bind(this));

    
}

SnmpSocketListener.prototype = new events.EventEmitter();

SnmpSocketListener.prototype.messageRecieved = function (msg, rinfo) {

    var request = snmp.parse(msg);
    var oid = convertOIDToString(request.pdu.varbinds[0].oid);

    this.nosql.all("doc.oid == '" + oid + "'", function (doc, offset) {


        var response = new snmp.Packet();
        response.pdu.type = asn1ber.pduTypes.GetResponsePDU;
        response.pdu.reqid = request.pdu.reqid;
        response.pdu.varbinds[0].type = asn1ber.types.OctetString;
        response.pdu.varbinds[0].oid = request.pdu.varbinds[0].oid;
        response.pdu.varbinds[0].value = doc[0].dataValue;

        var responseMessage = snmp.encode(response);

        console.log(responseMessage, 0, responseMessage.length, rinfo.port, rinfo.address);

        var responseSocket = dgram.createSocket("udp4");
        responseSocket.send(responseMessage, 0, responseMessage.length, rinfo.port, rinfo.address, function (err, bytes) {
            if (err) console.log(err);
            responseSocket.close();
        });
    });
}


exports.init = function (port, nosql) {
    return new SnmpSocketListener(port, nosql);
}