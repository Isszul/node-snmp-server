
var fs = require('fs');


function SnmpWalkParser(nosql) {
    this.nosql = nosql;
};


SnmpWalkParser.prototype.processSnmpWalkFile = function(filename) {

    fs.readFile(filename, "utf8", function(err, snmpWalkString) {
            if (err) throw err;

            snmpWalkString.split("\n").map(function(value, key) {

                this.nosql.insert({ 'value': value, 'key': key });
            });
    });

};




exports.load = exports.open = exports.SnmpWalkParser = exports.init = function(nosql) {
	return new SnmpWalkParser(nosql);
};
