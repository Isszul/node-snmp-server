var SNMP_PORT = 161;

var snmpSocketListener = require('./snmpSocketListener');
var nosql = require('nosql')
var snmpWalkParser = require('./snmpWalkParser').init();
var events = require('events');

var eventEmitter = new events.EventEmitter();

exports.init = function () {
    nosql.load("./tmpDB.nosql");

    nosql.clear();

    return eventEmitter;
};

exports.loadFile = function (filename) {

    snmpWalkParser.processSnmpWalkFile(filename, nosql);

    snmpWalkParser.on("fileprocessed", function () {

        snmpSocketListener.init(SNMP_PORT, nosql);

        eventEmitter.emit('listening');

    });
}