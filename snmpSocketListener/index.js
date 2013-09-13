
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

var snmpWalkToAsn1BerType = {
    "INTEGER": "Integer",
    "STRING": "OctetString",
    "Hex-STRING": "OctetString",
    "": "Null",
    "OID": "ObjectIdentifier",
    "Counter32" : "Counter",
    "Gauge32": "Gauge",
};


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

    var getNext = false;;
    if (request.pdu.type == asn1ber.pduTypes.GetNextRequestPDU || request.pdu.type == asn1ber.pduTypes.GetNextRequestPDU2) {
        nosqlFilter = "doc.oid != null && doc.oid > '" + oid + "'";
        getNext = true;
    }
    else {
        nosqlFilter = "doc.oid != null && doc.oid == '" + oid + "'";
    }


    this.nosql.one(nosqlFilter, function (doc, offset) {

        var response = new snmp.Packet();
        response.pdu.type = asn1ber.pduTypes.GetResponsePDU;
        response.pdu.reqid = request.pdu.reqid;

        console.log(new Date() + ":" + (getNext ? "GetNext" : "Get") + "Request id:" + request.pdu.reqid + ", OID: " + request.pdu.varbinds[0].oid + ", IpAddress :" + rinfo.address);

        var type;
        var oid;
        var value;

        if (doc != null){
            
            var docDataType = doc.dataType;
            type = snmpWalkToAsn1BerType[docDataType];
            if (docDataType == null || snmpWalkToAsn1BerType[docDataType] == null){
                type = asn1ber.types.Null;
            }
            else {
                type = asn1ber.types[snmpWalkToAsn1BerType[doc.dataType]] 
            }

            oid = convertStringToOID(doc.oid);

            var value = doc.dataValue;
            if (doc.dataType == "OID") {
                value =  convertStringToOID(doc.dataValue);
            }
        }
        else {
            type = asn1ber.types.NoSuchObject;
            oid = request.pdu.varbinds[0].oid;
            value = "";
        }

        response.pdu.varbinds[0].type = type; 
        response.pdu.varbinds[0].oid = oid;
        response.pdu.varbinds[0].value = value;

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