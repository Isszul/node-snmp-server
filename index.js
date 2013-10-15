var SNMP_PORT = 161;

var snmpSocketListener = require('./snmpSocketListener');
var nosql = require('nosql').load("./tmpDB.nosql");
var snmpWalkParser = require('./snmpWalkParser').init();
var events = require('events');

var events = new events.EventEmitter();

exports.setSnmpPort = function (snmpPort) {
    
    SNMP_PORT = snmpPort;

}
    

exports.loadFile = function (filename) {

    nosql.clear();

    snmpWalkParser.processSnmpWalkFile(filename, nosql);

    snmpWalkParser.on("fileprocessed", function () {

        snmpSocketListener.init(SNMP_PORT, nosql);

        events.emit('listening');

    });
}

exports.events = events;