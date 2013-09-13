
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


function buildPacket(request, type, oid, value) {
    
    var response = new snmp.Packet();
    response.pdu.type = asn1ber.pduTypes.GetResponsePDU;
    response.pdu.reqid = request.pdu.reqid;
    response.pdu.varbinds[0].type = type; 
    response.pdu.varbinds[0].oid = oid;
    response.pdu.varbinds[0].value = value;

    return response;
}


function getTypeFromDoc(doc) {

    var docDataType = doc.dataType;
    var type = snmpWalkToAsn1BerType[docDataType];
    if (docDataType == null || snmpWalkToAsn1BerType[docDataType] == null){
        type = asn1ber.types.Null;
    }
    else {
        type = asn1ber.types[snmpWalkToAsn1BerType[doc.dataType]] 
    }
    return type;         
}


function getValueFromDoc(doc) {
    
    var value = doc.dataValue;
    if (doc.dataType == "OID") {
        value =  convertStringToOID(doc.dataValue);
    }
    return value;
}


function SnmpSocketListener(port, nosql) {

    this.nosql = nosql;
    this.socket = dgram.createSocket('udp4');
    this.socket.bind(port);
    this.oidRequested;
    this.socket.on('message', this.messageRecieved.bind(this));
}



var filterGetOid = function(doc) {
    return doc.oid == this.oidRequested;
}

var filterGetNextOid = function(doc) {
    
    //TODO: Update this so it works!

    return doc.oid > this.oidRequested;
}


SnmpSocketListener.prototype = new events.EventEmitter();

SnmpSocketListener.prototype.messageRecieved = function (msg, rinfo) {

    var request = snmp.parse(msg);
    var oid = convertOIDToString(request.pdu.varbinds[0].oid);

    this.oidRequested = oid;

    var getNext = false;;
    if (request.pdu.type == asn1ber.pduTypes.GetNextRequestPDU || request.pdu.type == asn1ber.pduTypes.GetNextRequestPDU2) {
        nosqlFilter = filterGetNextOid.bind(this);
        getNext = true;
    }
    else {
        nosqlFilter = filterGetOid.bind(this);
    }


    this.nosql.one(nosqlFilter, function (doc, offset) {

        console.log(doc);
        console.log(new Date() + ":" + (getNext ? "GetNext" : "Get") + "Request id:" + request.pdu.reqid + ", OID: " + request.pdu.varbinds[0].oid + ", IpAddress :" + rinfo.address);

        var type;
        var oid;
        var value;

        if (doc != null){
            type = getTypeFromDoc(doc);
            oid = convertStringToOID(doc.oid);
            value = getValueFromDoc(doc);
        }
        else {
            type = asn1ber.types.NoSuchObject;
            oid = request.pdu.varbinds[0].oid;
            value = "";
        }

        var response = buildPacket(request, type, oid, value);

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