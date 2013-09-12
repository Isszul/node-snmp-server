
var nosql = require('nosql').load("./tmpDB.nosql");
nosql.clear();

var snmpWalkParser = require('./snmpWalkParser');

snmpWalkParser.processSnmpWalkFile("./example.snmpwalk", nosql);

nosql.update();

nosql.all("", function (doc, offset) {

    console.log(doc);

});