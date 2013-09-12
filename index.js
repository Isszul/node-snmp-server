var SNMP_PORT = 161;

var nosql = require('nosql').load("./tmpDB.nosql");
nosql.clear();

var snmpWalkParser = require('./snmpWalkParser').init();
snmpWalkParser.processSnmpWalkFile("./example.snmpwalk", nosql);

snmpWalkParser.on("fileprocessed", function () {

    var snmpSocketListener = require('./snmpSocketListener').init(SNMP_PORT, nosql);

});