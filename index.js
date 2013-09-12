var SNMP_PORT = 161;


var nosql = require('nosql').load("./tmpDB.nosql");
var snmpWalkParser = require('./snmpWalkParser').init();



nosql.clear();


snmpWalkParser.processSnmpWalkFile("./example.snmpwalk", nosql);


snmpWalkParser.on("fileprocessed", function () {

    var snmpSocketListener = require('./snmpSocketListener').init(SNMP_PORT, nosql);

});