
var nosql = require('nosql').load("./tmpDB.nosql");
nosql.clear();

var snmpWalkParser = require('./snmpWalkParser');

snmpWalkParser.processSnmpWalkFile("./example.snmpwalk", nosql,  function () {

    nosql.all("doc.oid == '.1.3.6.1.4.1.5528.100.4.1.10.1.5.1382714834'", function (doc, offset) {

        console.log(doc);

    });
});

