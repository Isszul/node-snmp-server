var SNMP_PORT = 161;


var nosql = require('nosql').load("./tmpDB.nosql");
var snmpWalkParser = require('./snmpWalkParser').init();
var snmpSocketListener = require('./snmpSocketListener').init(SNMP_PORT);


nosql.clear();


snmpWalkParser.processSnmpWalkFile("./example.snmpwalk", nosql);


snmpWalkParser.on("fileprocessed", function () {

    nosql.all("doc.oid == '.1.3.6.1.4.1.5528.100.4.1.10.1.5.1382714834'", function (doc, offset) {

        console.log(doc);

    });
});

