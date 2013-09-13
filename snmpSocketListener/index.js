
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

// Convert a string formatted OID to an array, leaving anything non-string alone.

function convertStringToOID(oid) {
    if (typeof oid !== 'string') {
        return oid;
    }

    if (oid[0] !== '.') {
        throw new Error('Invalid OID format');
    }

    oid = oid.split('.')
        .filter(function (s) {
            return s.length > 0;
        })
        .map(function (s) {
            return parseInt(s, 10);
        });

    return oid;
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


    if (request.pdu.type == asn1ber.pduTypes.GetNextRequestPDU) {
        nosqlFilter = "doc.oid > '" + oid + "'";
    }
    else {
        nosqlFilter = "doc.oid == '" + oid + "'";
    }


    this.nosql.one(nosqlFilter, function (doc, offset) {

        console.log(doc);

        var response = new snmp.Packet();
        response.pdu.type = asn1ber.pduTypes.GetResponsePDU;
        response.pdu.reqid = request.pdu.reqid;
        response.pdu.varbinds[0].type = (doc.dataValue != null) ? asn1ber.types.OctetString: asn1ber.types.Null;
        response.pdu.varbinds[0].oid = convertStringToOID(doc.oid);
        response.pdu.varbinds[0].value = doc.dataValue;

        var responseMessage = snmp.encode(response);

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