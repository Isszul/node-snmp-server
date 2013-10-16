
var events = require('events');
var dgram = require('dgram');
var asn1ber = require('../lib/asn1ber.js');
var snmp = require('../lib/snmp.js');
var util = require('../util');


function buildPacket(request, type, oid, value) {
    
    var response = new snmp.Packet();
    response.pdu.type = asn1ber.pduTypes.GetResponsePDU;
    response.pdu.reqid = request.pdu.reqid;
    response.pdu.varbinds[0].type = type; 
    response.pdu.varbinds[0].oid = oid;
    response.pdu.varbinds[0].value = value;

    return response;
}


function SnmpSocketListener(port, nosql) {
    console.log("Socket Listener started on port : " + port)
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
    var oid = request.pdu.varbinds[0].oid;

    this.oidRequested = oid;

    var getNext = (request.pdu.type == asn1ber.pduTypes.GetNextRequestPDU || request.pdu.type == asn1ber.pduTypes.GetNextRequestPDU2);

    var nosqlFilter = (getNext) ? filterGetNextOid.bind(this) : filterGetOid.bind(this);


    console.log((getNext ? "GetNext" : "Get") + "Request id:" + request.pdu.reqid + ", OID: " + request.pdu.varbinds[0].oid + ", IpAddress :" + rinfo.address);

    this.nosql.one(nosqlFilter, function (doc, offset) {

        if (doc) {
            console.log("Response found :" + JSON.stringify(doc));   
        } else {
            console.log("***Response not found***");
        }

        var type;
        var oid;
        var value;

        if (doc !== null) {
            type = doc.dataType;
            oid = doc.oid;
            value = doc.dataValue;
        }
        else {
            type = asn1ber.types.NoSuchObject;
            oid = request.pdu.varbinds[0].oid;
            value = 'noSuchObject';
        }
        console.log("Response:" + type + ", OID: " + oid + ", value: " + value);

        var response = buildPacket(request, type, oid, value);

        console.log("Response build " + JSON.stringify(response));

        var responseMessage = snmp.encode(response);

        var responseSocket = dgram.createSocket("udp4");
        responseSocket.send(responseMessage, 0, responseMessage.length, rinfo.port, rinfo.address, function (err, bytes) {
            if (err) {
                console.log(err);
            }
            responseSocket.close();
        });
    });
};

exports.init = function (port, nosql) {
    return new SnmpSocketListener(port, nosql);
};