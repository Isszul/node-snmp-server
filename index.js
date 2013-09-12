
var nosql = require('nosql').load("./tmpDB.nosql");
nosql.clear();

var snmpWalkParser = require('./snmpWalkParser').load(nosql);

snmpWalkParser.processSnmpWalkFile("./example.snmpwalk");
