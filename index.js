var SNMP_PORT = 161;

var snmpSocketListener = require('./snmpSocketListener');
var nosql = require('nosql').load("./tmpDB.nosql");
var snmpWalkParser = require('./snmpWalkParser').init();
var events = require('events');

var events = new events.EventEmitter();


exports.loadFile = function (filename) {

    nosql.clear();

    snmpWalkParser.processSnmpWalkFile(filename, nosql);

    snmpWalkParser.on("fileprocessed", function () {

        events.emit('fileprocessed');

    });
};

exports.startListening = function (port) {
    
    snmpSocketListener.init((port !== null) ? port : SNMP_PORT, nosql);
    
    snmpSocketListener.on('listening', function () {
       
       events.emit('listening');
        
    });
    
};

exports.events = events;